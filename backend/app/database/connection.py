import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# Ensure sqlite directory exists if SQLite is used
database_url = settings.DATABASE_URL
if database_url.startswith("sqlite"):
    # Extract path from sqlite:///path
    db_path = database_url.replace("sqlite:///", "")
    if db_path and db_path != ":memory:":
        db_dir = os.path.dirname(os.path.abspath(db_path))
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)

# Connect arguments for SQLite
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for providing database session to FastAPI route handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
