
import os
import json
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
from pipeline.run_pipeline import run_pipeline
from database.db import SessionLocal
from database.models import Opportunity
# Remove shadowing import so pipeline.run_pipeline.run_pipeline takes precedence
# from agents.planner_agent import run_pipeline
app = FastAPI()

# Enable robust CORS exactly allowing the frontend Next.js dev server on :3000 to trigger the engine
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

def save_opportunities(result: dict):
    from database.db import SessionLocal
    from database.models import Opportunity
    import json
    
    if not result or not isinstance(result, dict) or "opportunities" not in result:
        return

    print("Saving opportunities to database...")
    db = SessionLocal()
    try:
        date_val = result.get("date", "unknown")
        if date_val:
            db.query(Opportunity).filter(Opportunity.date == date_val).delete()
            
        opps = result.get("opportunities", [])
        for opp in opps:
            db.add(Opportunity(
                symbol=opp.get("symbol"),
                company=opp.get("company"),
                decision=opp.get("decision"),
                confidence=opp.get("confidence"),
                why_now=opp.get("why_now", ""),
                risks=json.dumps(opp.get("risks", [])),
                signals=json.dumps(opp.get("signals", [])),
                date=date_val
            ))
        
        db.commit()
        print(f"Saved {len(opps)} opportunities")
    except Exception as dbe:
        db.rollback()
        print("Database Error:", str(dbe))
        raise dbe
    finally:
        db.close()

@app.post("/pipeline/run")
def trigger_pipeline():
    start_time = time.time()
    try:
        result = run_pipeline()
        
        # Save output to database
        save_opportunities(result)

        duration = time.time() - start_time
        return {
            "status": "success", 
            "message": "Pipeline completed successfully", 
            "duration": f"{duration:.4f}s"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")

@app.get("/signals/today")
def get_signals_today():
    file_path = "data/cache/mock.json"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Mock data file not found.")
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


