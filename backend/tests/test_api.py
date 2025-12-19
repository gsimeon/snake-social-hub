from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import pytest
from src.main import app
from src.database import get_session
from src.models import User, LeaderboardEntry

# Use in-memory SQLite for tests
sqlite_url = "sqlite://"
engine = create_engine(
    sqlite_url, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)

def get_session_override():
    with Session(engine) as session:
        yield session

app.dependency_overrides[get_session] = get_session_override
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Snake Social Hub API is running"}

def test_auth_flow():
    # Signup
    signup_data = {"username": "TestUser", "email": "test@example.com", "password": "password123"}
    response = client.post("/auth/signup", json=signup_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["skin"] == "green" # Default value
    user_id = data["user"]["id"]

    # Login
    login_data = {"email": "test@example.com", "password": "password123"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["id"] == user_id

    # Update Profile (Skin)
    new_skin = "red"
    response = client.put(
        "/auth/profile", 
        json={"skin": new_skin},
        headers={"Authorization": f"Bearer {user_id}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["skin"] == new_skin
    
    # Verify persistence via get me
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {user_id}"})
    assert response.json()["data"]["skin"] == new_skin

def test_leaderboard():
    # Submit score (requires auth)
    # Create user
    signup_data = {"username": "ScoreUser", "email": "score@example.com", "password": "password123"}
    res = client.post("/auth/signup", json=signup_data)
    user_id = res.json()["user"]["id"]

    # Submit with auth
    response = client.post(
        "/leaderboard/", 
        json={"score": 5000, "mode": "walls"},
        headers={"Authorization": f"Bearer {user_id}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["score"] == 5000

    # Verify leaderboard updated
    response = client.get("/leaderboard/")
    data = response.json()
    assert any(e["score"] == 5000 for e in data["data"])

    # Verify filter by username
    response = client.get(f"/leaderboard/?username=ScoreUser")
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["username"] == "ScoreUser"
    
    # Verify filter returns empty for non-existent user
    response = client.get(f"/leaderboard/?username=Ghost")
    assert len(response.json()["data"]) == 0

def test_active_players():
    # This endpoint relies on in-memory store, which persists across tests unless reset.
    # But since we restart app fixtures, it might be cleared if we reset properly,
    # or it might assume the default mock data.
    # Our db implementation still has GameStateStore with empty init but no data.
    # We should probably manually inject data or just check success = true.
    response = client.get("/players/")
    assert response.status_code == 200
    assert response.json()["success"] is True
