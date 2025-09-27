import logging
import pandas as pd
from sklearn.linear_model import LinearRegression
from psycopg2.extras import RealDictCursor
from .database import get_db_connection, get_disease_data

logger = logging.getLogger(__name__)

def get_forecast_from_db(disease_type):
    """Get forecast data from database."""
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

def create_forecast(data, forecast_months=3):
    """Create forecast data using linear regression."""
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
    """Save forecast data to database."""
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

def get_disease_forecast_data(disease_type, months=24, forecast_months=6):
    """Get comprehensive forecast data including historical and forecast data."""
    try:
        valid_diseases = ['oncho', 'schistosomiasis', 'lf', 'helminths']
        if disease_type not in valid_diseases:
            return {"error": "Invalid disease type"}
        
        # Try to get cached data first
        cached_data = get_forecast_from_db(disease_type)
        if cached_data:
            logger.info(f"Returning cached forecast data for {disease_type}")
            return {
                "disease_type": disease_type,
                "historical_data": cached_data['historical_data'],
                "forecast_data": cached_data['forecast_data'],
                "combined_data": cached_data['combined_data'],
                "source": "cached"
            }
        
        # Generate new forecast if no cached data
        logger.info(f"Generating new forecast for {disease_type}")
        historical_data = get_disease_data(disease_type, months=months)
        if not historical_data:
            return {"error": "Failed to fetch historical data"}
        
        forecast_data = create_forecast(historical_data, forecast_months=forecast_months)
        if not forecast_data:
            return {"error": "Failed to create forecast"}
        
        # Save to database
        save_success = save_forecast_to_db(disease_type, forecast_data, historical_data)
        if not save_success:
            logger.warning(f"Failed to save forecast data for {disease_type}")
        
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
        
        combined_data = formatted_historical + forecast_data
        return {
            "disease_type": disease_type,
            "historical_data": formatted_historical,
            "forecast_data": forecast_data,
            "combined_data": combined_data,
            "source": "generated"
        }
    except Exception as e:
        logger.error(f"Error in forecast data generation: {e}")
        return {"error": str(e)}

def refresh_disease_forecast_data(disease_type, months=12, forecast_months=6):
    """Refresh forecast data by generating new forecast."""
    try:
        valid_diseases = ['oncho', 'schistosomiasis', 'lf', 'helminths']
        if disease_type not in valid_diseases:
            return {"error": "Invalid disease type"}
        
        logger.info(f"Refreshing forecast for {disease_type}")
        historical_data = get_disease_data(disease_type, months=months)
        if not historical_data:
            return {"error": "Failed to fetch historical data"}
        
        forecast_data = create_forecast(historical_data, forecast_months=forecast_months)
        if not forecast_data:
            return {"error": "Failed to create forecast"}
        
        save_success = save_forecast_to_db(disease_type, forecast_data, historical_data)
        if not save_success:
            return {"error": "Failed to save forecast data"}
        
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
        
        combined_data = formatted_historical + forecast_data
        return {
            "disease_type": disease_type,
            "historical_data": formatted_historical,
            "forecast_data": forecast_data,
            "combined_data": combined_data,
            "message": "Forecast refreshed successfully"
        }
    except Exception as e:
        logger.error(f"Error refreshing forecast: {e}")
        return {"error": str(e)}
