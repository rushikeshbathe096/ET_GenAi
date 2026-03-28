from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import crud
from database.db import get_db
from routers.auth_router import get_current_user
from database.models import User
from pipeline.run_pipeline import analyze_stock

router = APIRouter(prefix="/wishlist", tags=["wishlist"])

class WishlistItemBase(BaseModel):
    symbol: str

@router.post("/add")
def add_to_wishlist(item: WishlistItemBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_item = crud.add_to_wishlist(db=db, user_id=current_user.id, symbol=item.symbol)
    return {"symbol": db_item.symbol}

@router.get("")
def get_user_wishlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = crud.get_wishlist(db=db, user_id=current_user.id)
    return [{"symbol": item.symbol} for item in items]

@router.delete("/remove")
def remove_from_wishlist(item: WishlistItemBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = crud.remove_from_wishlist(db=db, user_id=current_user.id, symbol=item.symbol)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found or not in your wishlist")
    return {"message": "Item removed"}

# Dashboard API
dashboard_router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@dashboard_router.get("")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = crud.get_wishlist(db=db, user_id=current_user.id)
    signals = []
    for item in items:
        res = analyze_stock(item.symbol)
        signals.append(res)
        
    return {"watchlist_signals": signals}
