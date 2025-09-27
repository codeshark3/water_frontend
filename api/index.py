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
from utils.lfa_analysis import analyze_lfa_lines
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

    