from datetime import date as date_cls
from threading import Lock
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from pipeline.run_pipeline import analyze_stock as run_pipeline_analyze_stock

from fastapi.middleware.cors import CORSMiddleware
from database import models, db
from routers import auth_router, stock_router, market_router, wishlist_router


# Initialize database tables
models.Base.metadata.create_all(bind=db.engine)

app = FastAPI(
    title="ET GenAI Stock Platform",
    description="Backend API for AI-powered stock analysis platform",
    version="1.0.0"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router)
app.include_router(stock_router.router)
app.include_router(market_router.router)
app.include_router(wishlist_router.router)
app.include_router(wishlist_router.dashboard_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the ET GenAI Stock Platform API"}

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
    user_id: int
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
def get_dashboard(user_id: int = Query(default=1)) -> Dict[str, Any]:
    session = db.SessionLocal()
    from database import crud
    try:
        items = crud.get_wishlist(session, user_id=user_id)
        symbols = [item.symbol for item in items]
    finally:
        session.close()

    analyzed = [run_pipeline_analyze_stock(symbol) for symbol in symbols]
    analyzed.sort(key=lambda row: int(row.get("confidence", 0)), reverse=True)

    return _api_response(
        {
            "user_id": user_id,
            "count": len(analyzed),
            "stocks": analyzed,
        }
    )


@app.post("/wishlist/add")
def wishlist_add(payload: WishlistItem) -> Dict[str, Any]:
    symbol = _normalize_symbol(payload.symbol)
    session = db.SessionLocal()
    from database import crud
    try:
        crud.add_to_wishlist(session, user_id=payload.user_id, symbol=symbol)
        items = crud.get_wishlist(session, user_id=payload.user_id)
        symbols = [item.symbol for item in items]
    finally:
        session.close()

    return _api_response({"user_id": payload.user_id, "symbols": symbols}, "symbol added")


@app.get("/wishlist")
def wishlist_get(user_id: int = Query(...)) -> Dict[str, Any]:
    session = db.SessionLocal()
    from database import crud
    try:
        items = crud.get_wishlist(session, user_id=user_id)
        symbols = [item.symbol for item in items]
    finally:
        session.close()

    return _api_response({"user_id": user_id, "symbols": symbols})


@app.delete("/wishlist/remove")
def wishlist_remove(user_id: int = Query(...), symbol: str = Query(...)) -> Dict[str, Any]:
    symbol = _normalize_symbol(symbol)
    session = db.SessionLocal()
    from database import crud
    try:
        crud.remove_from_wishlist(session, user_id=user_id, symbol=symbol)
        items = crud.get_wishlist(session, user_id=user_id)
        symbols = [item.symbol for item in items]
    finally:
        session.close()

    return _api_response({"user_id": user_id, "symbols": symbols}, "symbol removed")