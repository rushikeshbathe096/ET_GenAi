import os
import json
import time
from datetime import date
from fastapi import APIRouter
from pipeline.run_pipeline import get_market_summary, run_market_pipeline, get_analytics_summary

_market_cache = {"data": None, "timestamp": 0}
CACHE_TTL = 3600  # 1 hour in seconds

router = APIRouter(prefix="/market", tags=["market"])

def get_cached_signals():
    path = "data/signals/today.json"
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                data = json.load(f)
                if data.get("generated_date") == date.today().strftime("%Y-%m-%d"):
                    return data.get("opportunities")
        except:
            pass
    return None

@router.get("/overview")
def get_market_overview():
    """Return high-level market summary (indices, sectors, health)."""
    return get_market_summary()

@router.get("/signals")
def get_market_signals():
    global _market_cache
    now = time.time()
    
    if _market_cache["data"] is not None and (now - _market_cache["timestamp"]) < CACHE_TTL:
        return {"stocks": _market_cache["data"]}
    
    results = run_market_pipeline()
    _market_cache["data"] = results
    _market_cache["timestamp"] = now
    return {"stocks": results}

@router.get("/analytics")
def get_analytics():
    """Return analytics summary with optimized lookup."""
    cached_signals = get_cached_signals()
    return get_analytics_summary(signals=cached_signals)
