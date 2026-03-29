from fastapi import APIRouter
from pipeline.run_pipeline import get_market_summary, run_market_pipeline, get_analytics_summary

router = APIRouter(prefix="/market", tags=["market"])

@router.get("/overview")
def get_market_overview():
    """Return high-level market summary (indices, sectors, health)."""
    return get_market_summary()

@router.get("/signals")
def get_signals():
    """Return detailed stock signals."""
    results = run_market_pipeline()
    return {"stocks": results}

@router.get("/analytics")
def get_analytics():
    """Return analytics summary."""
    return get_analytics_summary()
