import os
import json
import time
from datetime import date as date_cls
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Query, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import models, db, crud
from routers import auth_router, stock_router, market_router, wishlist_router, opportunities_router
from pipeline.run_pipeline import analyze_stock as run_pipeline_analyze_stock, run_market_pipeline

# Initialize database tables
models.Base.metadata.create_all(bind=db.engine)

app = FastAPI(
    title="ET GenAI Stock Platform",
    description="AI-powered autonomous stock signal generation and decision platform for Indian markets",
    version="2.1.0"
)

# Robust CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Module Integrations
app.include_router(auth_router.router)
app.include_router(stock_router.router)
app.include_router(market_router.router)
app.include_router(opportunities_router.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "vision": "Autonomous Alpha Generation Engine",
        "endpoints": {
            "Radar": "/opportunities",
            "Market": "/market/overview",
            "Signals": "/market/signals",
            "Analysis": "/stock/{ID}",
            "Pipeline": "/pipeline/run"
        }
    }

class WishlistItem(BaseModel):
    user_id: int = 1
    symbol: str

def save_output_cache(results: list):
    """Refreshes the high-performance signal cache for fast delivery."""
    try:
        cache_dir = "data/cache"
        os.makedirs(cache_dir, exist_ok=True)
        
        # Today's signal cache as defined in project summary 8.2
        cache_file = os.path.join(cache_dir, "today.json")
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
            
        # Historical archive
        archive_dir = "data/signals"
        os.makedirs(archive_dir, exist_ok=True)
        archive_file = os.path.join(archive_dir, f"{date_cls.today().strftime('%Y-%m-%d')}.json")
        with open(archive_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
            
    except Exception as ce:
        print(f"Cache Layer Failure: {ce}")

def persist_to_db(results: list):
    """Atomically commits pipeline results to the SQLite record store."""
    session = db.SessionLocal()
    try:
        today_str = date_cls.today().strftime("%Y-%m-%d")
        
        # Fresh daily rebuild to avoid stale duplicates
        session.query(models.Opportunity).filter(models.Opportunity.date == today_str).delete()
            
        for opp in results:
            session.add(models.Opportunity(
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
        raise dbe
    finally:
        session.close()

@app.post("/pipeline/run")
def trigger_pipeline():
    """Manual trigger for the full Intelligence Orchestrator (M1 -> M2 -> M3)."""
    start_time = time.time()
    try:
        # Step 1: Execute market-wide signal detection logic
        results = run_market_pipeline()
        
        # Step 2: Refresh the fast readout cache
        save_output_cache(results)
        
        # Step 3: Commit findings to persistent database
        persist_to_db(results)

        return {
            "status": "success", 
            "message": "Intelligence pipeline synchronized successfully",
            "duration_sec": round(time.time() - start_time, 2),
            "payload_size": len(results)
        }
    except Exception as e:
        print(f"PIPELINE_ERROR: {e}")
        raise HTTPException(status_code=500, detail="Intelligence Node synchronization failed")

@app.get("/signals/today")
def get_latest_signals():
    """High-speed endpoint for dashboard consumers."""
    path = "data/signals/today.json"
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            pass
    raise HTTPException(status_code=404, detail="Signal Node offline")

@app.get("/dashboard")
def legacy_dashboard_proxy(user_id: int = Query(default=1)):
    """Watchlist-driven analysis for personal dashboard sections."""
    session = db.SessionLocal()
    try:
        items = crud.get_wishlist(session, user_id=user_id)
        symbols = [item.symbol for item in items]
    finally:
        session.close()

    # Fallback universe if list is empty
    if not symbols:
        symbols = ["TCS", "INFY", "RELIANCE"]

    analyzed = []
    for s in symbols:
        try:
            analyzed.append(run_pipeline_analyze_stock(s))
        except:
            continue

    return {
        "status": "success",
        "data": {
            "user_id": user_id,
            "stocks": sorted(analyzed, key=lambda x: int(x.get("confidence", 0)), reverse=True)
        }
    }

# Wishlist compatibility endpoints as per Phase 3 requirements
@app.get("/wishlist")
def get_watchlist(user_id: int = 1):
    session = db.SessionLocal()
    try:
        items = crud.get_wishlist(session, user_id=user_id)
        return {"status": "success", "data": {"symbols": [i.symbol for i in items]}}
    finally:
        session.close()

@app.post("/wishlist/add")
def add_to_watchlist(payload: WishlistItem):
    session = db.SessionLocal()
    try:
        symbol = payload.symbol.upper().strip()
        crud.add_to_wishlist(session, user_id=payload.user_id, symbol=symbol)
        return {"status": "success", "message": f"{symbol} added to node"}
    finally:
        session.close()

@app.delete("/wishlist/remove")
def remove_from_watchlist(user_id: int = 1, symbol: str = Query(...)):
    session = db.SessionLocal()
    try:
        symbol = symbol.upper().strip()
        crud.remove_from_wishlist(session, user_id=user_id, symbol=symbol)
        return {"status": "success", "message": f"{symbol} delinked"}
    finally:
        session.close()
