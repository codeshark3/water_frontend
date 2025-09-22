from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import logging
import cv2
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import urllib.parse
import uuid
import json

import numpy as np
from PIL import Image



# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
app.logger.setLevel(logging.INFO)

# Database configuration using hardcoded URL
def get_db_config():
    #postgres_url = "postgresql://postgres:source20@localhost:5432/postgres"
    postgres_url="postgres://default:Hm3LiYyWXEj0@ep-divine-queen-a46g3ush-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require"
    try:
        parsed = urllib.parse.urlparse(postgres_url)
        db_config = {
            'host': parsed.hostname,
            'port': parsed.port or 5432,
            'database': parsed.path.lstrip('/'),
            'user': parsed.username,
            'password': parsed.password
        }
        logger.info(f"Database config: {db_config['host']}:{db_config['port']}/{db_config['database']}")
        return db_config
    except Exception as e:
        logger.error(f"Error parsing POSTGRES_URL: {e}")
        return None

def get_db_connection():
    try:
        db_config = get_db_config()
        if not db_config:
            return None
        conn = psycopg2.connect(**db_config)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

# ---------------- Mobile results persistence ---------------- #

def _ensure_mobile_results_table(conn):
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS water_ml_mobile_results (
                id TEXT PRIMARY KEY,
                "participantId" TEXT,
                name TEXT,
                age INTEGER,
                gender TEXT,
                location TEXT,
                "createdAt" TIMESTAMP,
                "createdBy" TEXT,
                oncho TEXT,
                schistosomiasis TEXT,
                lf TEXT,
                helminths TEXT,
                raw_result JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
            """
        )
        conn.commit()
        cursor.close()
        return True
    except Exception as e:
        logger.error(f"Error ensuring mobile results table: {e}")
        try:
            conn.rollback()
        except Exception:
            pass
        return False

def _parse_int(value):
    try:
        if value is None:
            return None
        return int(value)
    except Exception:
        return None

def _parse_timestamp(value):
    try:
        if not value:
            return datetime.now()
        # Attempt ISO parse; fallback to now
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except Exception:
        return datetime.now()

def _status_from_analysis(analysis: dict):
    try:
        if analysis is None:
            return None
        if analysis.get('test_present'):
            return 'positive'
        if analysis.get('control_present') and not analysis.get('test_present'):
            return 'negative'
        return None
    except Exception:
        return None

# save_mobile_result_to_db function removed - now using Next.js API as single source of truth
import os, requests

def send_to_drizzle(form_data: dict, analysis: dict):
    """Send data to Next.js API which uses Drizzle to write to database"""
    payload = {
        "participantId": form_data.get("participantId"),
        "name": form_data.get("name"),
        "age": form_data.get("age"),
        "gender": form_data.get("gender"),
        "location": form_data.get("location"),
        "createdAt": form_data.get("createdAt"),   # ISO timestamp or omit
        "createdBy": form_data.get("createdBy"),
        "userId": form_data.get("userId"),         # User ID for foreign key reference
        "oncho": analysis.get("oncho"),            # 1|2|"positive"|"negative"|None
        "schistosomiasis": analysis.get("schisto"),
        "lf": analysis.get("lf"),
        "helminths": analysis.get("helminths"),
    }

    next_base = os.environ.get("https://water_frontend.vercel.app", "http://127.0.0.1:3000")
    url = f"{next_base}/api/mobile-results"
    
    # Log the request payload
    logger.info(f"Sending data to Next.js API: {url}")
    logger.info(f"Request payload: {payload}")
    
    r = requests.post(url, json=payload, timeout=15)
    
    # Log the response
    logger.info(f"Next.js API response status: {r.status_code}")
    logger.info(f"Next.js API response headers: {dict(r.headers)}")
    
    r.raise_for_status()
    data = r.json()  # { ok: true, id, table: "water_ml_tests" } on success
    
    # Log the response data
    logger.info(f"Next.js API response data: {data}")
    
    return data
# ---------------- LFA line detection utilities ---------------- #

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

# ---------------- Existing forecasting endpoints (unchanged) ---------------- #

def get_disease_data(disease_type, months=12):
    try:
        conn = get_db_connection()
        if not conn:
            return None
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
        SELECT 
            DATE_TRUNC('month', "date") as month,
            COUNT(*) as total_tests,
            COUNT(CASE WHEN "{}" = 'positive' THEN 1 END) as positive_cases,
            ROUND(((COUNT(CASE WHEN "{}" = 'positive' THEN 1 END)::float / COUNT(*)) * 100)::numeric, 2) as infection_rate
        FROM water_ml_tests 
        WHERE "date" IS NOT NULL
        AND "{}" IS NOT NULL
        GROUP BY DATE_TRUNC('month', "date")
        ORDER BY month
        """.format(disease_type, disease_type, disease_type)
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        logger.error(f"Error fetching disease data: {e}")
        return None

def create_forecast(data, forecast_months=3):
    try:
        if not data or len(data) < 2:
            return None
        df = pd.DataFrame(data)
        df['month'] = pd.to_datetime(df['month'])
        df = df.sort_values('month')
        df['month_num'] = (df['month'] - df['month'].min()).dt.days / 30
        X = df[['month_num']].values
        y_infection_rate = df['infection_rate'].values
        y_positive_cases = df['positive_cases'].values
        y_total_tests = df['total_tests'].values
        model_rate = LinearRegression()
        model_cases = LinearRegression()
        model_total = LinearRegression()
        model_rate.fit(X, y_infection_rate)
        model_cases.fit(X, y_positive_cases)
        model_total.fit(X, y_total_tests)
        last_month = df['month'].max()
        future_months = []
        for i in range(1, forecast_months + 1):
            # Add months properly to avoid duplicates
            if last_month.month + i > 12:
                year = last_month.year + ((last_month.month + i - 1) // 12)
                month = ((last_month.month + i - 1) % 12) + 1
            else:
                year = last_month.year
                month = last_month.month + i
            future_month = pd.Timestamp(year=year, month=month, day=1)
            future_months.append(future_month)
        
        future_month_nums = [(future_month - df['month'].min()).days / 30 for future_month in future_months]
        future_X = pd.DataFrame(future_month_nums)[0].values.reshape(-1, 1)
        forecast_rates = model_rate.predict(future_X)
        forecast_cases = model_cases.predict(future_X)
        forecast_total = model_total.predict(future_X)
        forecast_rates = pd.Series(forecast_rates).clip(0, 100)
        forecast_cases = pd.Series(forecast_cases).clip(0, None)
        forecast_total = pd.Series(forecast_total).clip(0, None)
        forecast_data = []
        for i, month in enumerate(future_months):
            forecast_data.append({
                'month': month.strftime('%Y-%m'),
                'forecasted_infection_rate': round(float(forecast_rates.iloc[i]), 2),
                'forecasted_positive_cases': round(float(forecast_cases.iloc[i]), 0),
                'forecasted_total_tests': round(float(forecast_total.iloc[i]), 0),
                'is_forecast': True
            })
        return forecast_data
    except Exception as e:
        logger.error(f"Error creating forecast: {e}")
        return None

def save_forecast_to_db(disease_type, forecast_data, historical_data):
    try:
        conn = get_db_connection()
        if not conn:
            return False
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM water_ml_forecasts 
            WHERE "diseaseType" = %s AND "isForecast" = true
        """, (disease_type,))
        for row in historical_data:
            cursor.execute("""
                INSERT INTO water_ml_forecasts 
                (id, "diseaseType", month, "isForecast", "totalTests", "positiveCases", "infectionRate", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                "totalTests" = EXCLUDED."totalTests",
                "positiveCases" = EXCLUDED."positiveCases",
                "infectionRate" = EXCLUDED."infectionRate",
                "updatedAt" = NOW()
            """, (
                f"{disease_type}_{row['month'].strftime('%Y-%m')}_hist",
                disease_type,
                row['month'].strftime('%Y-%m'),
                False,
                row['total_tests'],
                row['positive_cases'],
                row['infection_rate']
            ))
        for row in forecast_data:
            cursor.execute("""
                INSERT INTO water_ml_forecasts 
                (id, "diseaseType", month, "isForecast", "forecastedInfectionRate", "forecastedPositiveCases", "forecastedTotalTests", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                "forecastedInfectionRate" = EXCLUDED."forecastedInfectionRate",
                "forecastedPositiveCases" = EXCLUDED."forecastedPositiveCases",
                "forecastedTotalTests" = EXCLUDED."forecastedTotalTests",
                "updatedAt" = NOW()
            """, (
                f"{disease_type}_{row['month']}_forecast",
                disease_type,
                row['month'],
                True,
                row['forecasted_infection_rate'],
                row['forecasted_positive_cases'],
                row['forecasted_total_tests']
            ))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error saving forecast to database: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False

# Deprecated: keep for backward compatibility but route now uses analyze_lfa_lines
# def get_contour_value(img):
#     try:
#         img = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
#         img = cv2.inRange(img, (150, 60, 100), (255, 255, 255))
#         kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 11))
#         img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel, 6)
#         contours, hier = cv2.findContours(img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
#         contour_value = len(contours)
#         logger.info(f"Contour value: {contour_value}")
#         return contour_value
#     except Exception as e:
#         logger.error(f"Error in get_contour_value: {e}")
#         return None

def get_forecast_from_db(disease_type):
    try:
        conn = get_db_connection()
        if not conn:
            return None
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT 
                month,
                "isForecast",
                "totalTests",
                "positiveCases",
                "infectionRate",
                "forecastedInfectionRate",
                "forecastedPositiveCases",
                "forecastedTotalTests"
            FROM water_ml_forecasts 
            WHERE "diseaseType" = %s
            ORDER BY month
        """, (disease_type,))
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        if not results:
            return None
        historical_data = []
        forecast_data = []
        for row in results:
            if row['isForecast']:
                forecast_data.append({
                    'month': row['month'],
                    'forecasted_infection_rate': row['forecastedInfectionRate'],
                    'forecasted_positive_cases': row['forecastedPositiveCases'],
                    'forecasted_total_tests': row['forecastedTotalTests'],
                    'is_forecast': True
                })
            else:
                historical_data.append({
                    'month': row['month'],
                    'total_tests': row['totalTests'],
                    'positive_cases': row['positiveCases'],
                    'infection_rate': row['infectionRate'],
                    'is_forecast': False
                })
        return {
            'historical_data': historical_data,
            'forecast_data': forecast_data,
            'combined_data': historical_data + forecast_data
        }
    except Exception as e:
        logger.error(f"Error fetching forecast from database: {e}")
        return None

@app.route("/flask-api/forecast/<disease_type>", methods=["GET"])
def get_disease_forecast(disease_type):
    try:
        valid_diseases = ['oncho', 'schistosomiasis', 'lf', 'helminths']
        if disease_type not in valid_diseases:
            return jsonify({"error": "Invalid disease type"}), 400
        cached_data = get_forecast_from_db(disease_type)
        if cached_data:
            logger.info(f"Returning cached forecast data for {disease_type}")
            return jsonify({
                "disease_type": disease_type,
                "historical_data": cached_data['historical_data'],
                "forecast_data": cached_data['forecast_data'],
                "combined_data": cached_data['combined_data'],
                "source": "cached"
            })
        logger.info(f"Generating new forecast for {disease_type}")
        historical_data = get_disease_data(disease_type, months=24)
        if not historical_data:
            return jsonify({"error": "Failed to fetch historical data"}), 500
        forecast_data = create_forecast(historical_data, forecast_months=6)
        if not forecast_data:
            return jsonify({"error": "Failed to create forecast"}), 500
        save_success = save_forecast_to_db(disease_type, forecast_data, historical_data)
        if not save_success:
            logger.warning(f"Failed to save forecast data for {disease_type}")
        formatted_historical = []
        for row in historical_data:
            formatted_historical.append({
                'month': row['month'].strftime('%Y-%m'),
                'total_tests': row['total_tests'],
                'positive_cases': row['positive_cases'],
                'infection_rate': float(row['infection_rate']),
                'is_forecast': False
            })
        combined_data = formatted_historical + forecast_data
        return jsonify({
            "disease_type": disease_type,
            "historical_data": formatted_historical,
            "forecast_data": forecast_data,
            "combined_data": combined_data,
            "source": "generated"
        })
    except Exception as e:
        logger.error(f"Error in forecast endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/flask-api/forecast/<disease_type>/refresh", methods=["POST"])
def refresh_disease_forecast(disease_type):
    try:
        valid_diseases = ['oncho', 'schistosomiasis', 'lf', 'helminths']
        if disease_type not in valid_diseases:
            return jsonify({"error": "Invalid disease type"}), 400
        logger.info(f"Refreshing forecast for {disease_type}")
        historical_data = get_disease_data(disease_type, months=12)
        if not historical_data:
            return jsonify({"error": "Failed to fetch historical data"}), 500
        forecast_data = create_forecast(historical_data, forecast_months=6)
        if not forecast_data:
            return jsonify({"error": "Failed to create forecast"}), 500
        save_success = save_forecast_to_db(disease_type, forecast_data, historical_data)
        if not save_success:
            return jsonify({"error": "Failed to save forecast data"}), 500
        formatted_historical = []
        for row in historical_data:
            formatted_historical.append({
                'month': row['month'].strftime('%Y-%m'),
                'total_tests': row['total_tests'],
                'positive_cases': row['positive_cases'],
                'infection_rate': float(row['infection_rate']),
                'is_forecast': False
            })
        combined_data = formatted_historical + forecast_data
        return jsonify({
            "disease_type": disease_type,
            "historical_data": formatted_historical,
            "forecast_data": forecast_data,
            "combined_data": combined_data,
            "message": "Forecast refreshed successfully"
        })
    except Exception as e:
        logger.error(f"Error refreshing forecast: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/flask-api/python", methods=["GET"])
def test_connection():
    return jsonify({"status": "ok", "message": "Server is running"})

def select_data_from_database(table, limit=10):
    """Select data from a whitelisted table with optional limit."""
    allowed_tables = ["water_ml_tests", "water_ml_forecasts"]
    if table not in allowed_tables:
        logger.warning(f"Attempt to access non-whitelisted table: {table}")
        return None
    try:
        conn = get_db_connection()
        if not conn:
            return None
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = f'SELECT * FROM {table} LIMIT %s'
        cursor.execute(query, (limit,))
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        logger.error(f"Error selecting data from {table}: {e}")
        return None

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

    