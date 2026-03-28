
import os
import json
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time

# Safely import the internal pipeline orchestration
from agents.planner_agent import run_pipeline

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

@app.post("/pipeline/run")
def trigger_pipeline():
    start_time = time.time()
    try:
        run_pipeline()
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
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
