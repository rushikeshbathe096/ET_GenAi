from database.db import SessionLocal
from database.models import User  # or whatever your model is

db = SessionLocal()

new_user = User(
    email="test@gmail.com",
    password_hash="123456"
)

db.add(new_user)
db.commit()
db.close()

print("Inserted!")