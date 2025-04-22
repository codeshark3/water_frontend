from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
import numpy as np
import cv2
import io
import os
import json
import base64
import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
app.logger.setLevel(logging.INFO)

@app.route("/flask-api/python", methods=["GET"])
def test_connection():
    return jsonify({"status": "ok", "message": "Server is running"})

@app.route("/flask-api/python", methods=["POST"])
def process_tests():
    try:
        logger.info(f"Content-Type: {request.content_type}")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Form data: {request.form}")
        logger.info(f"Files: {request.files}")
        
        # Check if the request is multipart form data or JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Handle multipart form data
            participant_data = {
                "participantId": request.form.get("participantId", ""),
                "name": request.form.get("name", ""),
                "age": request.form.get("age", ""),
                "gender": request.form.get("gender", ""),
                "location": request.form.get("location", ""),
                "createdAt": request.form.get("createdAt", ""),
                "createdBy": request.form.get("createdBy", "")
            }
            oncho_image = request.files.get("onchoImage")
            schisto_image = request.files.get("schistoImage")
            lf_image = request.files.get("lfImage")
            helminth_image = request.files.get("helminthImage")
            
            logger.info(f"Oncho image: {oncho_image}")
            logger.info(f"Schisto image: {schisto_image}")
            logger.info(f"Lf image: {lf_image}")
            logger.info(f"Helminth image: {helminth_image}")
            results = {}
            # Process images with correct keys
            def process_image(image):
              
                img = cv2.imread(image)
                img = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
            
                img = cv2.inRange(img, (150, 60, 100), (255, 255, 255))

                kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11,11))

                img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel, 6)

                contours, hier = cv2.findContours(img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
                contour_value = len(contours)
                return contour_value
        
            results["oncho"] = process_image(oncho_image)
            results["schisto"] = process_image(schisto_image)
            results["lf"] = process_image(lf_image)
            results["helminth"] = process_image(helminth_image)
            logger.info(f"Participant data: {participant_data}")
            # Create a data object combining participant data and timestamp
            data_to_save = {
                **participant_data,
                "timestamp": datetime.datetime.now().isoformat(),
                "results": results
            }
            
            # Ensure the data directory exists
            os.makedirs('./api/data', exist_ok=True)
            
            # Generate unique filename using timestamp
            filename = f"./api/data/test_{data_to_save['timestamp'].replace(':', '-')}.json"
            
            # Save to JSON file
            with open(filename, 'w') as f:
                json.dump(data_to_save, f, indent=4)
                
            logger.info(f"Data saved to {filename}")
        # # Save to JSON file
        # with open('./api/contour_data.json', 'w') as f:
        #     json.dump(results, f, indent=4)
            
        return jsonify(participant_data)
    
            
    
       
    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        logger.error(error_msg)
        return jsonify({"error": error_msg}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5238, debug=True)