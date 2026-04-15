import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("❌ No DATABASE_URL found in .env")
    sys.exit(1)

print(f"Connecting to: {db_url.split('@')[-1]}") # Print only host part for security

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"✅ Connection Successful: {result.scalar()}")
except Exception as e:
    print(f"❌ Connection Failed: {e}")
