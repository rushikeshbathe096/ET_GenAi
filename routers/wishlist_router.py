from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import crud
from database.db import get_db
from routers.auth_router import get_current_user
from database.models import User
from pipeline.run_pipeline import analyze_stock

router = APIRouter(prefix="/wishlist", tags=["wishlist"])

class WishlistItemBase(BaseModel):
    user_id: Optional[int] = 1
    symbol: str

@router.post("/add")
def add_to_wishlist(item: WishlistItemBase, db: Session = Depends(get_db)):
    # Simple mode for demo compatibility
    symbol = item.symbol.upper().strip()
    db_item = crud.add_to_wishlist(db=db, user_id=item.user_id, symbol=symbol)
    return {"status": "success", "symbol": db_item.symbol, "user_id": db_item.user_id}

@router.get("")
def get_user_wishlist(user_id: int = Query(default=1), db: Session = Depends(get_db)):
    items = crud.get_wishlist(db=db, user_id=user_id)
    return {"status": "success", "data": {"symbols": [item.symbol for item in items]}}

@router.delete("/remove")
def remove_from_watchlist(user_id: int = Query(default=1), symbol: str = Query(...), db: Session = Depends(get_db)):
    symbol = symbol.upper().strip()
    success = crud.remove_from_wishlist(db=db, user_id=user_id, symbol=symbol)
    if not success:
        return {"status": "error", "message": "Target not found"}
    return {"status": "success", "message": f"{symbol} delinked"}

# Dashboard API Integration
router_dashboard = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router_dashboard.get("")
def get_dashboard_summary(user_id: int = Query(default=1), db: Session = Depends(get_db)):
    items = crud.get_wishlist(db=db, user_id=user_id)
    symbols = [item.symbol for item in items]
    
    if not symbols:
        symbols = ["TCS", "INFY", "RELIANCE"]
        
    signals = []
    for s in symbols:
        try:
            res = analyze_stock(s)
            signals.append(res)
        except:
            continue
            
    return {
        "status": "success",
        "data": {
            "user_id": user_id,
            "stocks": sorted(signals, key=lambda x: int(x.get("confidence", 0)), reverse=True)
        }
    }
