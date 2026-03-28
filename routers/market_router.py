from fastapi import APIRouter

router = APIRouter(prefix="/market", tags=["market"])

@router.get("")
def get_market_overview():
    # Return 20 mock stocks
    return [
        {"symbol": "AAPL", "price": 170.12, "change_pct": 1.2},
        {"symbol": "MSFT", "price": 400.15, "change_pct": 0.8},
        {"symbol": "GOOGL", "price": 145.30, "change_pct": -0.5},
        {"symbol": "AMZN", "price": 175.50, "change_pct": 1.5},
        {"symbol": "META", "price": 485.10, "change_pct": -1.2},
        {"symbol": "TSLA", "price": 200.50, "change_pct": -2.0},
        {"symbol": "NVDA", "price": 850.25, "change_pct": 3.1},
        {"symbol": "BRK.B", "price": 410.20, "change_pct": 0.1},
        {"symbol": "LLY", "price": 750.00, "change_pct": 2.5},
        {"symbol": "AVGO", "price": 1300.50, "change_pct": 1.8},
        {"symbol": "V", "price": 280.90, "change_pct": 0.3},
        {"symbol": "JPM", "price": 190.40, "change_pct": -0.7},
        {"symbol": "UNH", "price": 490.10, "change_pct": 0.4},
        {"symbol": "MA", "price": 470.50, "change_pct": -0.2},
        {"symbol": "HD", "price": 380.20, "change_pct": -1.0},
        {"symbol": "COST", "price": 740.30, "change_pct": 1.1},
        {"symbol": "PG", "price": 160.80, "change_pct": 0.5},
        {"symbol": "MRK", "price": 125.60, "change_pct": 0.2},
        {"symbol": "ABBV", "price": 170.90, "change_pct": -0.4},
        {"symbol": "CRM", "price": 305.40, "change_pct": 1.4},
    ]
