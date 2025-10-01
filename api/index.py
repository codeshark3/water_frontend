from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import logging
import cv2
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import uuid
import json

import numpy as np
from PIL import Image

# Import from our new modules
from utils.database import get_db_connection, get_disease_data, select_data_from_database
from utils.mobile_utils import _parse_int, _parse_timestamp, _status_from_analysis, send_to_drizzle

from utils.forecast import get_forecast_from_db, create_forecast, save_forecast_to_db, get_disease_forecast_data, refresh_disease_forecast_data



# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
app.logger.setLevel(logging.INFO)

# Database functions moved to utils/database.py

# ---------------- Mobile results persistence ---------------- #
# Mobile utility functions moved to utils/mobile_utils.py
# ---------------- LFA line detection utilities ---------------- #
# LFA analysis functions moved to utils/lfa_analysis.py

# ---------------- Existing forecasting endpoints (unchanged) ---------------- #
# Database query functions moved to utils/database.py

# Forecast functions moved to utils/forecast.py

# Deprecated: keep for backward compatibility but route now uses analyze_lfa_lines
def get_contour_value(img):
    try:
        img = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
        img = cv2.inRange(img, (150, 60, 100), (255, 255, 255))
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 11))
        img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel, 6)
        contours, hier = cv2.findContours(img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        contour_value = len(contours)
        logger.info(f"Contour value: {contour_value}")
        return contour_value
    except Exception as e:
        logger.error(f"Error in get_contour_value: {e}")
        return None

# get_forecast_from_db moved to utils/forecast.py

@app.route("/flask-api/forecast/<disease_type>", methods=["GET"])
def get_disease_forecast(disease_type):
    try:
        result = get_disease_forecast_data(disease_type)
        if "error" in result:
            return jsonify(result), 500
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in forecast endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/flask-api/forecast/<disease_type>/refresh", methods=["POST"])
def refresh_disease_forecast(disease_type):
    try:
        result = refresh_disease_forecast_data(disease_type)
        if "error" in result:
            return jsonify(result), 500
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error refreshing forecast: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/flask-api/python", methods=["GET"])
def test_connection():
    return jsonify({"status": "ok", "message": "Server is running"})

# select_data_from_database moved to utils/database.py

@app.route("/flask-api/select-data", methods=["GET"])
def select_data_api():
    table = request.args.get("table")
    limit = int(request.args.get("limit", 10))
    if not table:
        return jsonify({"error": "Missing table parameter"}), 400
    data = select_data_from_database(table, limit)
    if data is None:
        return jsonify({"error": "Failed to select data or table not allowed"}), 400
    return jsonify({"table": table, "data": data})

@app.route("/flask-api/forecasts/<disease_type>", methods=["GET"])
def get_saved_forecasts(disease_type):
    try:
        data = get_forecast_from_db(disease_type)
        if not data:
            return jsonify({"error": "No forecast data found"}), 404
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error fetching saved forecasts: {e}")
        return jsonify({"error": str(e)}), 500



# New: ROI detection and perspective correction

def _detect_roi_and_warp(img_bgr: np.ndarray, target_size=(500, 200)) -> tuple[np.ndarray, dict]:
    """Find the test window ROI and warp it to a canonical view.
    Returns (roi_bgr, meta). If ROI not found, falls back to center-crop.
    """
    h, w = img_bgr.shape[:2]
    meta = {"roi_method": "fallback", "roi_box": None}
    try:
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        # Light denoise and edge detection
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blur, 30, 90)
        # Close gaps
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=1)
        # Find contours
        cnts, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        best = None
        best_score = 0.0
        for c in cnts:
            area = cv2.contourArea(c)
            if area < (w * h) * 0.01:
                continue
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            if len(approx) == 4:
                rect = approx.reshape(-1, 2).astype(np.float32)
                # Order points
                s = rect.sum(axis=1)
                diff = np.diff(rect, axis=1).ravel()
                ordered = np.zeros((4, 2), dtype=np.float32)
                ordered[0] = rect[np.argmin(s)]      # top-left
                ordered[2] = rect[np.argmax(s)]      # bottom-right
                ordered[1] = rect[np.argmin(diff)]   # top-right
                ordered[3] = rect[np.argmax(diff)]   # bottom-left
                # Compute aspect ratio score close to a thin vertical window
                width = np.linalg.norm(ordered[1] - ordered[0])
                height = np.linalg.norm(ordered[3] - ordered[0])
                if width == 0 or height == 0:
                    continue
                ar = max(width, height) / (min(width, height) + 1e-6)
                # Prefer tall rectangles (ar>=2)
                score = area * (1.0 + (ar >= 2.0))
                if score > best_score:
                    best = ordered
                    best_score = score
        if best is not None:
            # Warp to target
            dst_w, dst_h = target_size[1], target_size[0]
            dst = np.array([[0, 0], [dst_w - 1, 0], [dst_w - 1, dst_h - 1], [0, dst_h - 1]], dtype=np.float32)
            M = cv2.getPerspectiveTransform(best, dst)
            roi = cv2.warpPerspective(img_bgr, M, (dst_w, dst_h))
            meta["roi_method"] = "warped"
            meta["roi_box"] = best.tolist()
            return roi, meta
    except Exception as e:
        logger.warning(f"ROI detection failed: {e}")
    # Fallback: center crop to typical slit aspect ratio
    ch, cw = int(h * 0.6), int(w * 0.35)
    y1 = max(0, h // 2 - ch // 2)
    y2 = min(h, y1 + ch)
    x1 = max(0, w // 2 - cw // 2)
    x2 = min(w, x1 + cw)
    roi = img_bgr[y1:y2, x1:x2]
    roi = cv2.resize(roi, (target_size[1], target_size[0]))
    meta["roi_box"] = [int(x1), int(y1), int(x2), int(y2)]
    return roi, meta

# New: simple gray-world white balance

def _gray_world_wb(img_bgr: np.ndarray) -> np.ndarray:
    img = img_bgr.astype(np.float32)
    avg_b, avg_g, avg_r = img.mean(axis=(0, 1))
    avg_gray = (avg_b + avg_g + avg_r) / 3.0 + 1e-6
    img[:, :, 0] *= (avg_gray / avg_b)
    img[:, :, 1] *= (avg_gray / avg_g)
    img[:, :, 2] *= (avg_gray / avg_r)
    img = np.clip(img, 0, 255).astype(np.uint8)
    return img

# Existing hue segmentation + Lab a* gating

def _segment_red_hues(hsv: np.ndarray, lab: np.ndarray) -> np.ndarray:
    lower1 = np.array([0, 60, 60], dtype=np.uint8)
    upper1 = np.array([15, 255, 255], dtype=np.uint8)
    lower2 = np.array([160, 50, 50], dtype=np.uint8)
    upper2 = np.array([179, 255, 255], dtype=np.uint8)
    mask1 = cv2.inRange(hsv, lower1, upper1)
    mask2 = cv2.inRange(hsv, lower2, upper2)
    mask = cv2.bitwise_or(mask1, mask2)
    # Gate by Lab a* channel (redness)
    a = lab[:, :, 1]
    a_mask = cv2.inRange(a, 135, 255)  # tuneable
    mask = cv2.bitwise_and(mask, a_mask)
    return mask

# Adaptive projection and peak picking with prominence

def _smooth_signal(sig: np.ndarray, ksize: int = 7) -> np.ndarray:
    ksize = max(3, ksize | 1)
    return cv2.GaussianBlur(sig.reshape(-1, 1), (ksize, 1), 0).ravel()


def _find_peaks_with_prominence(proj: np.ndarray, min_dist: int, min_width: int) -> list[dict]:
    peaks = []
    if proj.size == 0 or proj.max() <= 0:
        return peaks
    sm = _smooth_signal(proj, 7)
    # Adaptive threshold based on mean+std and a fraction of max
    thr = max(sm.mean() + 0.8 * sm.std(), 0.28 * sm.max())
    n = len(sm)
    i = 1
    while i < n - 1:
        if sm[i] > sm[i - 1] and sm[i] >= sm[i + 1] and sm[i] >= thr:
            # Walk left/right to local minima to compute prominence/width
            l = i
            while l > 0 and sm[l] >= sm[l - 1]:
                l -= 1
            r = i
            while r < n - 1 and sm[r] >= sm[r + 1]:
                r += 1
            # Width at half prominence
            peak_val = sm[i]
            left_min = sm[:i + 1].min() if i > 0 else sm[i]
            right_min = sm[i:].min() if i < n - 1 else sm[i]
            base = max(left_min, right_min)
            prominence = peak_val - base
            half = base + prominence / 2
            wl = i
            while wl > 0 and sm[wl] > half:
                wl -= 1
            wr = i
            while wr < n - 1 and sm[wr] > half:
                wr += 1
            width = max(1, wr - wl)
            if width >= min_width:
                peaks.append({"idx": i, "prominence": float(prominence), "width": int(width)})
            i = r + 1
        else:
            i += 1
    # Enforce min distance and keep strongest
    peaks.sort(key=lambda p: p["prominence"], reverse=True)
    selected = []
    taken = np.zeros(n, dtype=bool)
    for p in peaks:
        if any(abs(p["idx"] - q["idx"]) < min_dist for q in selected):
            continue
        selected.append(p)
        if len(selected) >= 3:
            break
    return selected


def _project_and_count(mask: np.ndarray) -> dict:
    mask_clean = cv2.medianBlur(mask, 3)
    # Assume lines are horizontal across a vertical slit → project rows
    proj_h = mask_clean.sum(axis=1).astype(np.float32)
    # Also compute vertical as fallback
    proj_v = mask_clean.sum(axis=0).astype(np.float32)

    # Min widths relative to ROI size
    min_w_h = max(3, mask_clean.shape[0] // 120)
    min_dist_h = max(8, mask_clean.shape[0] // 20)
    min_w_v = max(3, mask_clean.shape[1] // 120)
    min_dist_v = max(8, mask_clean.shape[1] // 20)

    peaks_h = _find_peaks_with_prominence(proj_h, min_dist_h, min_w_h)
    peaks_v = _find_peaks_with_prominence(proj_v, min_dist_v, min_w_v)

    score_h = sum(p["prominence"] for p in peaks_h)
    score_v = sum(p["prominence"] for p in peaks_v)

    if score_h >= score_v:
        peaks = peaks_h
        length = len(proj_h)
        orientation = "horizontal"
    else:
        peaks = peaks_v
        length = len(proj_v)
        orientation = "vertical"

    peaks_sorted = sorted(peaks, key=lambda p: p["idx"])[:2]
    positions = [p["idx"] / max(1, length - 1) for p in peaks_sorted]
    strengths = [p["prominence"] for p in peaks_sorted]
    return {
        "orientation": orientation,
        "count": int(len(peaks_sorted)),
        "indices": [int(p["idx"]) for p in peaks_sorted],
        "positions": [float(x) for x in positions],
        "strengths": [float(s) for s in strengths],
        "projection_length": int(length),
    }

# Intensity around peaks for T/C ratio

def _band_intensity(roi_hsv: np.ndarray, roi_lab: np.ndarray, orientation: str, indices: list[int], band_px: int = 6) -> list[float]:
    vals = []
    a = roi_lab[:, :, 1].astype(np.float32)
    s = roi_hsv[:, :, 1].astype(np.float32)
    metric = 0.6 * a + 0.4 * s  # redness + saturation
    if orientation == "horizontal":
        for idx in indices:
            y1 = max(0, idx - band_px)
            y2 = min(roi_hsv.shape[0], idx + band_px)
            band = metric[y1:y2, :]
            vals.append(float(band.mean() if band.size else 0.0))
    else:
        for idx in indices:
            x1 = max(0, idx - band_px)
            x2 = min(roi_hsv.shape[1], idx + band_px)
            band = metric[:, x1:x2]
            vals.append(float(band.mean() if band.size else 0.0))
    return vals

# Optional debug overlay saving

def _save_debug_overlay(roi_bgr: np.ndarray, orientation: str, indices: list[int]) -> str:
    dbg = roi_bgr.copy()
    color = (0, 0, 255)
    if orientation == "horizontal":
        for idx in indices:
            cv2.line(dbg, (0, int(idx)), (dbg.shape[1] - 1, int(idx)), color, 2)
    else:
        for idx in indices:
            cv2.line(dbg, (int(idx), 0), (int(idx), dbg.shape[0] - 1), color, 2)
    name = f"debug_{uuid.uuid4().hex[:8]}.png"
    path = os.path.join(os.path.dirname(__file__), 'data', name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cv2.imwrite(path, dbg)
    return name


def analyze_lfa_lines(img_bgr: np.ndarray, save_debug: bool = False) -> dict:
    """Robust analysis for lateral-flow assay lines with ROI detection and T/C.
    Returns detailed metrics with confidence and optional debug overlay filename.
    """
    try:
        roi_bgr, roi_meta = _detect_roi_and_warp(img_bgr)
        roi_bgr = _gray_world_wb(roi_bgr)

        # Color spaces and equalization
        hsv = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        v = clahe.apply(v)
        hsv_eq = cv2.merge([h, s, v])
        lab = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2Lab)

        # Segment likely line colors and clean
        mask = _segment_red_hues(hsv_eq, lab)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8), iterations=1)
        # Slight closing with ROI-relative kernel
        kx = max(3, roi_bgr.shape[1] // 80)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((1, kx), np.uint8), iterations=1)

        proj = _project_and_count(mask)
        indices = proj["indices"]
        intensities = _band_intensity(hsv_eq, lab, proj["orientation"], indices)

        # Classify control vs test by normalized position (assume top/left is control)
        control_present = False
        test_present = False
        tc_ratio = None
        labels = []
        if proj["count"] >= 1:
            # Pair up lines by position
            lines = list(zip(indices, proj["positions"], intensities))
            lines.sort(key=lambda x: x[1])
            if len(lines) == 1:
                control_present = True
                test_present = False
                labels = ["C"]
            else:
                # Two strongest/nearest lines: first is control, second test
                control_present = True
                test_present = True
                labels = ["C", "T"]
                # T/C intensity ratio
                tc_ratio = float(lines[1][2] / (lines[0][2] + 1e-6))

        # Confidence from strengths normalized by area
        area_norm = mask.size * 10.0
        conf = min(1.0, (sum(proj["strengths"]) / (area_norm + 1e-6)) + (0.05 * proj["count"]))

        debug_file = _save_debug_overlay(roi_bgr, proj["orientation"], indices) if save_debug else None

        return {
            'line_count': int(proj["count"]),
            'orientation': proj['orientation'],
            'line_positions': proj['positions'],
            'line_indices': indices,
            'line_strengths': proj['strengths'],
            'intensities': intensities,
            'control_present': control_present,
            'test_present': test_present,
            'tc_ratio': tc_ratio,
            'confidence': float(conf),
            'roi': roi_meta,
            'debug_image': debug_file,
        }
    except Exception as e:
        logger.error(f"Error analyzing LFA lines: {e}")
        return {
            'line_count': 0,
            'orientation': 'unknown',
            'line_positions': [],
            'line_indices': [],
            'line_strengths': [],
            'intensities': [],
            'control_present': False,
            'test_present': False,
            'tc_ratio': None,
            'confidence': 0.0,
            'roi': {"roi_method": "error", "roi_box": None},
            'debug_image': None,
        }


@app.route("/flask-api/get-mobile-data", methods=["POST"])
def get_mobile_data():
    if request.content_type.startswith("multipart/form-data"):
        # Handle form data and files
        form_data = request.form.to_dict()
        files = {}
        # Optional debug overlay
        debug_flag = request.args.get('debug', '0') == '1'
        
        # Create results dictionary to save to JSON
        results = {
            "timestamp": datetime.now().isoformat(),
            "patient_data": form_data,
            "image_analysis": {}
        }
        
        for key in request.files:
            file = request.files[key]
            
            # Process image in memory
            try:
                img_array = np.frombuffer(file.read(), np.uint8)
                img_bgr = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                
                if img_bgr is not None:
                    analysis = analyze_lfa_lines(img_bgr, save_debug=debug_flag)
                    files[key] = {
                        "filename": file.filename,
                        "content_type": file.content_type,
                        **analysis,
                        # Back-compat
                        "contour_value": analysis['line_count']
                    }
                    results["image_analysis"][key] = files[key]
                else:
                    files[key] = {
                        "filename": file.filename,
                        "content_type": file.content_type,
                        "line_count": 0,
                        "orientation": "unknown",
                        "line_positions": [],
                        "line_indices": [],
                        "line_strengths": [],
                        "intensities": [],
                        "control_present": False,
                        "test_present": False,
                        "tc_ratio": None,
                        "confidence": 0.0,
                        "roi": {"roi_method": "invalid", "roi_box": None},
                        "debug_image": None,
                        "contour_value": 0,
                    }
                    results["image_analysis"][key] = files[key]
            except Exception as e:
                logger.error(f"Error processing image {file.filename}: {e}")
                files[key] = {
                    "filename": file.filename,
                    "content_type": file.content_type,
                    "line_count": 0,
                    "orientation": "error",
                    "line_positions": [],
                    "line_indices": [],
                    "line_strengths": [],
                    "intensities": [],
                    "control_present": False,
                    "test_present": False,
                    "tc_ratio": None,
                    "confidence": 0.0,
                    "roi": {"roi_method": "error", "roi_box": None},
                    "debug_image": None,
                    "contour_value": 0,
                    "error": str(e)
                }
                results["image_analysis"][key] = files[key]
        
        # Save results to JSON file
        try:
            import json
            json_filename = f"mobile_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            json_path = os.path.join(os.path.dirname(__file__), 'data', json_filename)
            
            # Ensure data directory exists
            os.makedirs(os.path.dirname(json_path), exist_ok=True)
            
            with open(json_path, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            
            logger.info(f"Results saved to {json_path}")
            
        except Exception as e:
            logger.error(f"Error saving JSON file: {e}")
            # Continue without saving JSON if there's an error

        print("Form data:", form_data)
        print("Files:", files)
        print("Results saved to JSON")

        # Forward summarized record to Next.js API (single source of truth)
        db_saved = False
        table_name = None
        row_id = None
        try:
            # Use the helper function to send data to Drizzle via Next.js API
            analysis_map = (results or {}).get('image_analysis', {}) or {}
            analysis_data = {
                'oncho': 2 if (analysis_map.get('onchoImage') or {}).get('test_present') else (1 if (analysis_map.get('onchoImage') or {}).get('control_present') else None),
                'schisto': 2 if (analysis_map.get('schistoImage') or {}).get('test_present') else (1 if (analysis_map.get('schistoImage') or {}).get('control_present') else None),
                'lf': 2 if (analysis_map.get('lfImage') or {}).get('test_present') else (1 if (analysis_map.get('lfImage') or {}).get('control_present') else None),
                'helminths': 2 if (analysis_map.get('helminthImage') or {}).get('test_present') else (1 if (analysis_map.get('helminthImage') or {}).get('control_present') else None),
            }
            
            response_data = send_to_drizzle(form_data, analysis_data)
            db_saved = response_data.get('ok', False)
            table_name = response_data.get('table', 'tests')
            row_id = response_data.get('id')
            
        except Exception as e:
            logger.error(f"Next.js save error: {e}")

        return jsonify({
            "message": "Data processed successfully (multipart)", 
            "form": form_data, 
            "files": files,
            "json_file": json_filename if 'json_filename' in locals() else None,
            "db": { "saved": db_saved, "table": table_name, "id": row_id }
        }), 200
        
    elif request.is_json:
        data = request.get_json()
        print("JSON data:", data)
        return jsonify({"message": "Data received successfully (json)", "data": data}), 200
    else:
        return jsonify({"error": "Unsupported Content-Type"}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5238, debug=True)

    