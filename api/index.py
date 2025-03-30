from flask import Flask, jsonify
from PIL import Image
import numpy as np
import cv2
import os
import requests


app = Flask(__name__)


@app.route("/api/python")
def process_tests():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(current_dir, "features.png")
    
    try:
        # Read image directly with OpenCV instead of PIL
        img = cv2.imread(image_path)
        if img is None:
            return jsonify({"error": "Could not load image"}), 400
            
        # Convert BGR to HSV (OpenCV loads as BGR by default)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Rest of your processing
        mask = cv2.inRange(hsv, (150, 60, 100), (255, 255, 255))
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11,11))
        processed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, 6)
        contours, _ = cv2.findContours(processed, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        return jsonify({"count": len(contours)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/thon")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/api/python/process/<test_id>")
def process_tests(test_id):
  
    current_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(current_dir, "features.png")
    
    try:
        # Read image directly with OpenCV instead of PIL
        img = cv2.imread(image_path)
        if img is None:
            return jsonify({"error": "Could not load image"}), 400
            
        # Convert BGR to HSV (OpenCV loads as BGR by default)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Rest of your processing
        mask = cv2.inRange(hsv, (150, 60, 100), (255, 255, 255))
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11,11))
        processed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, 6)
   
        
        contours, _ = cv2.findContours(processed, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        count = len(contours)
        
        # Call the update function (you'll need to implement the API call)
        requests.post(f"http://localhost:3000/api/tests/{test_id}/update", json={"result": count})
        
        return jsonify({"count": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)


