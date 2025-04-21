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


app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

@app.route("/flask-api/python", methods=["GET"])
def test_connection():
    return jsonify({"status": "ok", "message": "Server is running"})

@app.route("/flask-api/python", methods=["POST"])
def process_tests():
    try:
        print("Content-Type:", request.content_type)
        print("Request method:", request.method)
        print("Form data:", request.form)
        print("Files:", request.files)
        
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
            print("Participant data:", participant_data)
            
            for file_name in request.files:
               process_image(file_name, request.files)
            
            results = {}
            # Process images with correct keys
            def process_image(file_name, files):
                print(file_name)
                img = Image.open(files[file_name])
                img = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
            
                img = cv2.inRange(img, (150, 60, 100), (255, 255, 255))

                kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11,11))

                img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel, 6)

                contours, hier = cv2.findContours(img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
                contour_value = len(contours)
                results[file_name] = contour_value


        
        # Save to JSON file
        with open('./api/contour_data.json', 'w') as f:
            json.dump(results, f, indent=4)
            
        return jsonify(results)
    
            
    
       
    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        print(error_msg)
        return jsonify({"error": error_msg}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5238, debug=True)
   