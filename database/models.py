from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.db import Base
from sqlalchemy import Float

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    wishlist = relationship("Wishlist", back_populates="user")

class Wishlist(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(50), index=True, nullable=False)

    user = relationship("User", back_populates="wishlist")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), index=True)
    company = Column(String(255))
    decision = Column(String(50))
    confidence = Column(Float)
    why_now = Column(Text)
    risks = Column(Text)
    signals = Column(Text)
    date = Column(String(50))
