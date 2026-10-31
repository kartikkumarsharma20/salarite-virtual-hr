import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.connection import Base, get_db
from app.main import app
from app.models import User, Task, Interview, TaskActivity
from app.core.security import get_password_hash, create_access_token

# In-memory SQLite database for isolated test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test function."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Seed test users
        employer = User(
            email="test.employer@salarite.com",
            full_name="Test Employer",
            role="employer",
            hashed_password=get_password_hash("Password123!"),
            is_active=True,
        )
        vhr1 = User(
            email="test.vhr1@salarite.com",
            full_name="Test Virtual HR 1",
            role="virtual_hr",
            hashed_password=get_password_hash("Password123!"),
            is_active=True,
        )
        vhr2 = User(
            email="test.vhr2@salarite.com",
            full_name="Test Virtual HR 2",
            role="virtual_hr",
            hashed_password=get_password_hash("Password123!"),
            is_active=True,
        )
        db.add_all([employer, vhr1, vhr2])
        db.commit()
        db.refresh(employer)
        db.refresh(vhr1)
        db.refresh(vhr2)

        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def employer_token(db_session):
    user = db_session.query(User).filter(User.email == "test.employer@salarite.com").first()
    return create_access_token(subject=user.id, role=user.role, email=user.email)


@pytest.fixture(scope="function")
def vhr1_token(db_session):
    user = db_session.query(User).filter(User.email == "test.vhr1@salarite.com").first()
    return create_access_token(subject=user.id, role=user.role, email=user.email)


@pytest.fixture(scope="function")
def vhr2_token(db_session):
    user = db_session.query(User).filter(User.email == "test.vhr2@salarite.com").first()
    return create_access_token(subject=user.id, role=user.role, email=user.email)
