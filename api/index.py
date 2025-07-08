from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import urllib.parse

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5238, debug=True)

    