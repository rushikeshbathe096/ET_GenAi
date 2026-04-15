from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv
import os
import logging

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DB_NODE")

DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./et_genai.db"
FALLBACK_URL = "sqlite:///./et_genai.db"

def create_resilient_engine(url):
    engine_kwargs = {}
    if url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        # Robust settings for remote MySQL connections (Railway/RDS)
        engine_kwargs["pool_pre_ping"] = True
        engine_kwargs["pool_recycle"] = 3600
        engine_kwargs["pool_size"] = 10
        engine_kwargs["max_overflow"] = 20
        
        # Only apply SSL and strict timeouts for remote connections
        if "localhost" not in url and "127.0.0.1" not in url:
            engine_kwargs["connect_args"] = {
                "connect_timeout": 10,
                "ssl": {"ssl": {}} 
            }
        else:
            engine_kwargs["connect_args"] = {
                "connect_timeout": 10
            }

    return create_engine(url, **engine_kwargs)

# Initial Attempt
try:
    logger.info(f"Connecting to primary database node...")
    engine = create_resilient_engine(DATABASE_URL)
    # Test connection immediately
    with engine.connect() as conn:
        logger.info("✅ Primary database node online.")
except (OperationalError, Exception) as e:
    logger.warning(f"⚠️ Primary node unreachable: {e}")
    logger.info("🔄 Falling back to local SQLite storage...")
    engine = create_resilient_engine(FALLBACK_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()