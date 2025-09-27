import os
import requests
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def _parse_int(value):
    """Parse integer value with error handling."""
    try:
        if value is None:
            return None
        return int(value)
    except Exception:
        return None

def _parse_timestamp(value):
    """Parse timestamp value with error handling."""
    try:
        if not value:
            return datetime.now()
        # Attempt ISO parse; fallback to now
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except Exception:
        return datetime.now()

def _status_from_analysis(analysis: dict):
    """Extract status from analysis results."""
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

    next_base = os.environ.get("NEXT_BASE_URL", "http://127.0.0.1:3000")
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
