from datetime import date as date_cls
from threading import Lock
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from pipeline.run_pipeline import analyze_stock as run_pipeline_analyze_stock


app = FastAPI(
    title="ET GenAI Dynamic API",
    description="Request-driven stock analysis backend",
    version="2.0.0",
)


DEFAULT_UNIVERSE = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "LT", "ITC", "HINDUNILVR", "BHARTIARTL",
    "ASIANPAINT", "KOTAKBANK", "AXISBANK", "MARUTI", "SUNPHARMA", "TITAN", "ULTRACEMCO", "BAJFINANCE",
    "NESTLEIND", "WIPRO", "TATAMOTORS", "M&M", "POWERGRID", "NTPC", "ADANIPORTS", "JSWSTEEL", "INDUSINDBK",
    "TECHM", "HCLTECH", "ONGC",
]

_WISHLIST: Dict[str, set[str]] = {}
_WISHLIST_LOCK = Lock()


class WishlistItem(BaseModel):
    user_id: str
    symbol: str


def _api_response(data: Any, message: str = "ok") -> Dict[str, Any]:
    return {
        "status": "success",
        "message": message,
        "data": data,
    }


def _normalize_symbol(symbol: str) -> str:
    symbol = str(symbol or "").strip().upper()
    if not symbol:
        raise HTTPException(status_code=400, detail="symbol is required")
    return symbol


def _symbol_matches(value: Any, symbol: str) -> bool:
    return str(value or "").strip().upper() == symbol


@app.get("/stock/{symbol}")
def get_stock_analysis(symbol: str) -> Dict[str, Any]:
    from pipeline.run_pipeline import analyze_stock
    result = analyze_stock(symbol)
    return result

@app.get("/market")
def market():
    from pipeline.run_pipeline import run_market_pipeline
    results = run_market_pipeline()
    return {"stocks": results}


@app.get("/dashboard")
def get_dashboard(user_id: str = Query(default="demo-user")) -> Dict[str, Any]:
    user_key = str(user_id).strip() or "demo-user"

    with _WISHLIST_LOCK:
        symbols = sorted(_WISHLIST.get(user_key, set()))

    analyzed = [run_pipeline_analyze_stock(symbol) for symbol in symbols]
    analyzed.sort(key=lambda row: int(row.get("confidence", 0)), reverse=True)

    return _api_response(
        {
            "user_id": user_key,
            "count": len(analyzed),
            "stocks": analyzed,
        }
    )


@app.post("/wishlist/add")
def wishlist_add(payload: WishlistItem) -> Dict[str, Any]:
    user_key = str(payload.user_id).strip()
    symbol = _normalize_symbol(payload.symbol)

    if not user_key:
        raise HTTPException(status_code=400, detail="user_id is required")

    with _WISHLIST_LOCK:
        _WISHLIST.setdefault(user_key, set()).add(symbol)
        symbols = sorted(_WISHLIST[user_key])

    return _api_response({"user_id": user_key, "symbols": symbols}, "symbol added")


@app.get("/wishlist")
def wishlist_get(user_id: str = Query(...)) -> Dict[str, Any]:
    user_key = str(user_id).strip()
    if not user_key:
        raise HTTPException(status_code=400, detail="user_id is required")

    with _WISHLIST_LOCK:
        symbols = sorted(_WISHLIST.get(user_key, set()))

    return _api_response({"user_id": user_key, "symbols": symbols})


@app.delete("/wishlist/remove")
def wishlist_remove(user_id: str = Query(...), symbol: str = Query(...)) -> Dict[str, Any]:
    user_key = str(user_id).strip()
    symbol = _normalize_symbol(symbol)

    if not user_key:
        raise HTTPException(status_code=400, detail="user_id is required")

    with _WISHLIST_LOCK:
        if user_key in _WISHLIST:
            _WISHLIST[user_key].discard(symbol)
            symbols = sorted(_WISHLIST[user_key])
        else:
            symbols = []

    return _api_response({"user_id": user_key, "symbols": symbols}, "symbol removed")