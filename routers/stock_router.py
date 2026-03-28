from fastapi import APIRouter
from pipeline.run_pipeline import analyze_stock

router = APIRouter(prefix="/stock", tags=["stock"])

@router.get("/{symbol}")
def get_stock_analysis(symbol: str):
    return analyze_stock(symbol)