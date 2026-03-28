from sqlalchemy.orm import Session
from database import models

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, email: str, password_hash: str):
    db_user = models.User(email=email, password_hash=password_hash)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_wishlist(db: Session, user_id: int):
    return db.query(models.Wishlist).filter(models.Wishlist.user_id == user_id).all()

def add_to_wishlist(db: Session, user_id: int, symbol: str):
    # Check if already exists
    existing = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == user_id, 
        models.Wishlist.symbol == symbol
    ).first()
    
    if existing:
        return existing
        
    db_item = models.Wishlist(user_id=user_id, symbol=symbol)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def remove_from_wishlist(db: Session, user_id: int, symbol: str):
    db_item = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == user_id, 
        models.Wishlist.symbol == symbol
    ).first()
    
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False
