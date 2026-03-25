from fastapi import FastAPI
from routers.data_router import router as data_router
from routers.opportunities_router import router as opportunities_router

app = FastAPI(
    title="ET GenAI API",
    description="AI system for detecting stock opportunities using multi-signal analysis",
    version="1.0.0"
)

# Root endpoint (health check)
@app.get("/")
def root():
    return {"message": "ET GenAI Data API is running"}

# M1 — Data Layer
app.include_router(
    data_router,
    prefix="/data",
    tags=["Data"]
)

# M2 — Analysis Layer
app.include_router(
    opportunities_router,
    prefix="/analysis",
    tags=["Analysis"]
)