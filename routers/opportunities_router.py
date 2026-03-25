from fastapi import APIRouter
from agents.analysis_agent import compute_signals
from agents.utils.data_loader import load_latest_data

router = APIRouter()

@router.get("/opportunities")
def get_opportunities():
    data = load_latest_data()
    signals = compute_signals(data)

    return {
        "status": "success",
        "count": len(signals),
        "opportunities": signals
    }