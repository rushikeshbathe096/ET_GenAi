from fastapi import FastAPI
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
