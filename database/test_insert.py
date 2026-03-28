from passlib.context import CryptContext
from database.db import SessionLocal
from database import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

hashed_password = pwd_context.hash("test123")

new_user = models.User(
    email="testuser@gmail.com",
    password_hash=hashed_password   # ✅ CORRECT FIELD NAME
)

db.add(new_user)
db.commit()
db.close()

print("User created ✅")