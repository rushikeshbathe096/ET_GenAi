import os
import json
import time
from datetime import date as date_cls
from threading import Lock
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from database import models, db
from routers import auth_router, stock_router, market_router, wishlist_router, opportunities_router
from pipeline.run_pipeline import analyze_stock as run_pipeline_analyze_stock, run_market_pipeline

# Initialize database tables
models.Base.metadata.create_all(bind=db.engine)

app = FastAPI(
    title="ET GenAI Stock Platform",
    description="Backend API for AI-powered autonomous stock signal generation and decision platform",
    version="2.0.0"
)

# Setup CORS - Allowing frontend to trigger the engine
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all modular routers
app.include_router(auth_router.router)
app.include_router(stock_router.router)
app.include_router(market_router.router)
app.include_router(wishlist_router.router)
app.include_router(opportunities_router.router)

@app.get("/")
def read_root():
    return {
        "status": "success",
        "message": "Welcome to the ET GenAI Stock Platform API",
        "version": "2.0.0",
        "endpoints": [
            "/opportunities - Top ranked signals",
            "/market/overview - Sector health",
            "/market/signals - All market signals",
            "/stock/{symbol} - Deep dive analysis",
            "/wishlist - User watchlist management",
            "/pipeline/run - Trigger analysis engine"
        ]
    }

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

def save_opportunities_to_db(result: list):
    """Saves pipeline analysis results to the SQLite database."""
    from database.db import SessionLocal
    from database.models import Opportunity
    import json
    
    if not result:
        return

    session = SessionLocal()
    try:
        # For simplicity, we use today's date for record management
        today_str = date_cls.today().strftime("%Y-%m-%d")
        
        # Optional: Clear today's previous results to avoid duplicates
        session.query(Opportunity).filter(Opportunity.date == today_str).delete()
            
        for opp in result:
            session.add(Opportunity(
                symbol=opp.get("symbol"),
                company=opp.get("company"),
                decision=opp.get("decision"),
                confidence=opp.get("confidence"),
                why_now=opp.get("why_now", ""),
                risks=json.dumps(opp.get("risks", [])),
                signals=json.dumps(opp.get("signals", [])),
                date=today_str
            ))
        
        session.commit()
    except Exception as dbe:
        session.rollback()
        print("Database Persistence Error:", str(dbe))
        raise dbe
    finally:
        session.close()

@app.post("/pipeline/run")
def trigger_pipeline():
    """Executes the complete Intelligence Pipeline (M1 -> M2 -> M3)."""
    start_time = time.time()
    try:
        # Run market-wide analysis
        results = run_market_pipeline()
        
        # Persist results for dashboard and historical tracking
        save_opportunities_to_db(results)

        duration = time.time() - start_time
        return {
            "status": "success", 
            "message": "Intelligence pipeline executed and persisted successfully",
            "duration": f"{duration:.2f}s",
            "count": len(results)
        }
    except Exception as e:
        print(f"Pipeline Execution Failure: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/signals/today")
def get_signals_today():
    """Retrieves the latest signal cache for high-performance delivery."""
    # Check for today's computed JSON cache or fallback to mock
    file_path = "data/cache/today.json"
    if not os.path.exists(file_path):
        file_path = "data/cache/mock.json"
        
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Signal cache is being rebuilt.")
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Cache readout failure.")

@app.get("/dashboard")
def get_dashboard_proxy(user_id: int = Query(default=1)):
    """Legacy endpoint proxying to watchlist-based analysis."""
    session = db.SessionLocal()
    from database import crud
    try:
        items = crud.get_wishlist(session, user_id=user_id)
        symbols = [item.symbol for item in items]
    finally:
        session.close()

    if not symbols:
        symbols = ["TCS", "RELIANCE", "INFY", "ONGC"]

    analyzed = []
    for symbol in symbols:
        try:
            res = run_pipeline_analyze_stock(symbol)
            analyzed.append(res)
        except:
            continue

    analyzed.sort(key=lambda row: int(row.get("confidence", 0)), reverse=True)

    return _api_response({
        "user_id": user_id,
        "count": len(analyzed),
        "stocks": analyzed
    })
