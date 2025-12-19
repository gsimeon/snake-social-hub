from fastapi.testclient import TestClient
from src.main import app
from src.database import db, MockDatabase
import pytest

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    # Reset mock DB before each test module/function if needed
    # But since it's a singleton, we need to be careful.
    # For now, we'll just let it accrue state or manually reset if implemented.
    # The MockDatabase doesn't have a clear methods currently, but we can verify basics.
    pass

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
    user_id = data["user"]["id"]

    # Login
    login_data = {"email": "test@example.com", "password": "password123"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["id"] == user_id

    # Get Me
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {user_id}"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["username"] == "TestUser"

def test_leaderboard():
    # Get initial leaderboard
    response = client.get("/leaderboard/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) > 0
    
    # Submit score (requires auth)
    # First verify failure without auth
    response = client.post("/leaderboard/", json={"score": 5000, "mode": "walls"})
    # Depends on implementation, currently returns 200 with success: false
    assert response.status_code == 200
    assert response.json()["success"] is False

    # Create user for score submission
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
    scores = [e["score"] for e in data["data"]]
    assert 5000 in scores

def test_active_players():
    response = client.get("/players/")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) > 0

    player_id = data["data"][0]["id"]
    response = client.get(f"/players/{player_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == player_id
