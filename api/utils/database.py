import urllib.parse
import logging
import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger(__name__)

def get_db_config():
    """Get database configuration from hardcoded URL."""
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
    """Get database connection using the configuration."""
    try:
        db_config = get_db_config()
        if not db_config:
            return None
        conn = psycopg2.connect(**db_config)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

def _ensure_mobile_results_table(conn):
    """Ensure the mobile results table exists."""
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

def get_disease_data(disease_type, months=12):
    """Get disease data from database for forecasting."""
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

# get_forecast_from_db moved to utils/forecast.py
