import os
import json
from datetime import date
from fastapi import APIRouter
from pipeline.run_pipeline import get_market_summary, run_market_pipeline, get_analytics_summary

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
def get_signals():
    """Return detailed stock signals with caching."""
    cached = get_cached_signals()
    if cached:
        return {"stocks": cached, "cache": True}
        
    results = run_market_pipeline()
    return {"stocks": results, "cache": False}

@router.get("/analytics")
def get_analytics():
    """Return analytics summary with optimized lookup."""
    cached_signals = get_cached_signals()
    return get_analytics_summary(signals=cached_signals)
