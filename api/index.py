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
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import numpy as np
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
app.logger.setLevel(logging.INFO)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'water_ml',
    'user': 'postgres',
    'password': 'password',
    'port': '5432'
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

def get_disease_data(disease_type, months=6):
    """Get historical disease data from database"""
    try:
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get data for the specified disease type
        query = """
        SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            COUNT(*) as total_tests,
            COUNT(CASE WHEN {} = 'positive' THEN 1 END) as positive_cases,
            ROUND(
                (COUNT(CASE WHEN {} = 'positive' THEN 1 END)::float / COUNT(*)) * 100, 2
            ) as infection_rate
        FROM tests 
        WHERE "createdAt" >= NOW() - INTERVAL '{} months'
        AND {} IS NOT NULL
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
        """.format(disease_type, disease_type, months, disease_type)
        
        cursor.execute(query)
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return results
    except Exception as e:
        logger.error(f"Error fetching disease data: {e}")
        return None

def create_forecast(data, forecast_months=3):
    """Create forecast using linear regression"""
    try:
        if not data or len(data) < 2:
            return None
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        df['month'] = pd.to_datetime(df['month'])
        df = df.sort_values('month')
        
        # Create features (months since start)
        df['month_num'] = (df['month'] - df['month'].min()).dt.days / 30
        
        # Prepare data for forecasting
        X = df[['month_num']].values
        y_infection_rate = df['infection_rate'].values
        y_positive_cases = df['positive_cases'].values
        
        # Create and train models
        model_rate = LinearRegression()
        model_cases = LinearRegression()
        
        model_rate.fit(X, y_infection_rate)
        model_cases.fit(X, y_positive_cases)
        
        # Generate future months
        last_month = df['month'].max()
        future_months = []
        for i in range(1, forecast_months + 1):
            future_month = last_month + timedelta(days=30*i)
            future_months.append(future_month)
        
        # Create forecast features
        future_month_nums = [(future_month - df['month'].min()).days / 30 for future_month in future_months]
        future_X = np.array(future_month_nums).reshape(-1, 1)
        
        # Make predictions
        forecast_rates = model_rate.predict(future_X)
        forecast_cases = model_cases.predict(future_X)
        
        # Ensure predictions are reasonable
        forecast_rates = np.clip(forecast_rates, 0, 100)
        forecast_cases = np.clip(forecast_cases, 0, None)
        
        # Create forecast data
        forecast_data = []
        for i, month in enumerate(future_months):
            forecast_data.append({
                'month': month.strftime('%Y-%m'),
                'forecasted_infection_rate': round(float(forecast_rates[i]), 2),
                'forecasted_positive_cases': round(float(forecast_cases[i]), 0),
                'is_forecast': True
            })
        
        return forecast_data
    except Exception as e:
        logger.error(f"Error creating forecast: {e}")
        return None

@app.route("/flask-api/forecast/<disease_type>", methods=["GET"])
def get_disease_forecast(disease_type):
    """Get disease forecast data"""
    try:
        # Validate disease type
        valid_diseases = ['oncho', 'schistosomiasis', 'lf', 'helminths']
        if disease_type not in valid_diseases:
            return jsonify({"error": "Invalid disease type"}), 400
        
        # Get historical data
        historical_data = get_disease_data(disease_type, months=12)
        if not historical_data:
            return jsonify({"error": "Failed to fetch historical data"}), 500
        
        # Create forecast
        forecast_data = create_forecast(historical_data, forecast_months=6)
        if not forecast_data:
            return jsonify({"error": "Failed to create forecast"}), 500
        
        # Format historical data
        formatted_historical = []
        for row in historical_data:
            formatted_historical.append({
                'month': row['month'].strftime('%Y-%m'),
                'total_tests': row['total_tests'],
                'positive_cases': row['positive_cases'],
                'infection_rate': float(row['infection_rate']),
                'is_forecast': False
            })
        
        # Combine historical and forecast data
        combined_data = formatted_historical + forecast_data
        
        return jsonify({
            "disease_type": disease_type,
            "historical_data": formatted_historical,
            "forecast_data": forecast_data,
            "combined_data": combined_data
        })
        
    except Exception as e:
        logger.error(f"Error in forecast endpoint: {e}")
        return jsonify({"error": str(e)}), 500


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
              
                img = Image.open(image)
                img = img.convert('RGB')
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
            # Send data to Next.js frontend
            try:
                frontend_url = 'http://localhost:3000/insert/results'  # Adjust URL as needed
                headers = {'Content-Type': 'application/json'}
                response = requests.post(frontend_url, json=data_to_save, headers=headers)
                
                if response.status_code != 200:
                    logger.error(f"Failed to send data to frontend: {response.text}")
                else:
                    logger.info("Successfully sent data to frontend")
            except Exception as e:
                logger.error(f"Error sending data to frontend: {str(e)}")
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

# Create API route for results
@app.route('/api/results', methods=['POST'])
def save_results():
    try:
        data = request.get_json()
        logger.info("Received data in API route")
        return jsonify({"message": "Data received successfully"})
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({"error": "Failed to process request"}), 500

# Ensure the data directory exists
os.makedirs('./api/data', exist_ok=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5238, debug=True)

    