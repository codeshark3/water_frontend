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
CORS(app)

@app.route("/flask-api/python", methods=["GET"])
def test_connection():
    return jsonify({"status": "ok", "message": "Server is running"})

@app.route("/flask-api/python", methods=["POST"])
def process_tests():
    try:
        # Get the JSON data from the request body
        test_data = request.get_json()
        if not test_data:
            return jsonify({"error": "No test data provided"}), 400

        # Extract specific values from test_data
        participant_data = {
            "participantId": test_data.get("participantId"),
            "name": test_data.get("name"),
            "age": test_data.get("age"),
            "gender": test_data.get("gender"),
            "location": test_data.get("location"),
            "createdAt": test_data.get("createdAt"),
            "createdBy": test_data.get("createdBy")
        }

        # Process images with correct keys
        results = {}
        image_keys = ['onchoImage', 'schistoImage', 'lfImage', 'helminthImage']  # Changed to lowercase
        
        for image_name in image_keys:
            if image_name not in test_data or not test_data[image_name]:
                results[image_name] = {"error": f"Image {image_name} not found in request"}
                continue
                
            try:
                # Get image directly from test_data
                img_base64 = test_data[image_name]
                
                if img_base64 is None:
                    results[image_name] = {"error": f"Could not load image {image_name}"}
                    continue
                
                # Decode base64 image
                image_data = base64.b64decode(img_base64)
                nparr = np.frombuffer(image_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is None:
                    results[image_name] = {"error": f"Could not decode image {image_name}"}
                    continue
            
                # Convert to HSV color space
                hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
                # Define HSV ranges for red (there are two red color ranges in HSV)
                lower_red1 = np.array([0, 50, 50])
                upper_red1 = np.array([10, 255, 255])
                lower_red2 = np.array([170, 50, 50])
                upper_red2 = np.array([180, 255, 255])

                # Create masks for red regions
                mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
                mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
                red_mask = mask1 + mask2  # Combine both masks

                # Perform morphological operations to remove noise
                kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
                red_mask = cv2.morphologyEx(red_mask, cv2.MORPH_CLOSE, kernel, iterations=2)

                # Find contours of detected red regions
                contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

                # Sort contours by their vertical position (y-coordinate)
                contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[1])

                # Determine test result based on detected red lines
                num_lines = len(contours)

                # Store results before cleaning up memory
                results[image_name] = {
                    "num_lines": num_lines,
                    "result": "Positive" if num_lines == 2 else "Negative" if num_lines == 1 else "Invalid"
                }

                # Clean up memory
                del img, hsv, red_mask, mask1, mask2, image_data, nparr

            except Exception as e:
                results[image_name] = {"error": f"Error processing {image_name}: {str(e)}"}
        
        # Construct final response
        final_response = {
            **participant_data,  # Spread participant data
            "results": results   # Add results
        }

        # Save to JSON file
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        results_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'results')
        os.makedirs(results_dir, exist_ok=True)
        filepath = os.path.join(results_dir, f"results_{timestamp}.json")
        
        try:
            with open(filepath, 'w') as f:
                json.dump(final_response, f, indent=2)
            print(f"Results saved to: {filepath}")
            return jsonify(final_response)
        except Exception as e:
            print(f"Error saving results: {str(e)}")
            return jsonify({"error": "Error saving results"}), 500
       
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5328, debug=True)
   