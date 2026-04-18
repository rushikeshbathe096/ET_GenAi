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
from pipeline.run_pipeline import run_market_pipeline

# Initialize database tables
models.Base.metadata.create_all(bind=db.engine)

app = FastAPI(
    title="Alpha Node Terminal API",
    description="Institutional-grade AI-powered stock intelligence engine",
    version="2.1.0"
)

# Robust CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Module Integrations
app.include_router(auth_router.router)
app.include_router(stock_router.router)
app.include_router(market_router.router)
app.include_router(opportunities_router.router)
app.include_router(wishlist_router.router)
app.include_router(wishlist_router.router_dashboard)

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
            "Pipeline": "/pipeline/run",
            "Watchlist": "/wishlist",
            "Dashboard": "/dashboard"
        }
    }

def save_output_cache(results: list):
    """Refreshes the high-performance signal cache."""
    try:
        cache_dir = "data/signals"
        os.makedirs(cache_dir, exist_ok=True)
        
        today_str = date_cls.today().strftime("%Y-%m-%d")
        response = {
            "status": "success",
            "count": len(results),
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "generated_date": today_str,
            "opportunities": results
        }
        
        # Consistent with opportunities_router cache path
        cache_file = os.path.join(cache_dir, "today.json")
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(response, f, indent=2)
            
        # Historical archive
        archive_file = os.path.join(cache_dir, f"{today_str}.json")
        with open(archive_file, "w", encoding="utf-8") as f:
            json.dump(response, f, indent=2)
            
    except Exception as ce:
        print(f"Cache Layer Failure: {ce}")

def persist_to_db(results: list):
    """Atomically commits pipeline results to the SQLite store."""
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
    """Manual trigger for the full Intelligence Orchestrator."""
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

