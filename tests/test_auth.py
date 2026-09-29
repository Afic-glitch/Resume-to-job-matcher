import uuid
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.db import init_db

@pytest.fixture
def client():
    init_db()
    return TestClient(app)

def test_demo_users_endpoint(client):
    res = client.get("/api/auth/demo-users")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3
    roles = [u["role"] for u in data]
    assert "recruiter" in roles
    assert "candidate" in roles
    assert "admin" in roles

def test_login_success(client):
    payload = {
        "email": "recruiter@resumematch.ai",
        "password": "recruiter123"
    }
    res = client.post("/api/auth/login", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == "recruiter@resumematch.ai"
    assert data["user"]["role"] == "recruiter"

def test_login_invalid_password(client):
    payload = {
        "email": "recruiter@resumematch.ai",
        "password": "wrongpassword"
    }
    res = client.post("/api/auth/login", json=payload)
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]

def test_login_user_not_found(client):
    payload = {
        "email": "nonexistent@example.com",
        "password": "password123"
    }
    res = client.post("/api/auth/login", json=payload)
    assert res.status_code == 401

def test_register_and_login_new_user(client):
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    reg_payload = {
        "name": "Jane Tester",
        "email": unique_email,
        "password": "mypassword123",
        "role": "candidate",
        "organization": "Stanford University"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["name"] == "Jane Tester"
    assert data["user"]["role"] == "candidate"

    # Now login with the newly registered user
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "mypassword123"
    })
    assert login_res.status_code == 200
    assert login_res.json()["user"]["name"] == "Jane Tester"

def test_register_duplicate_email(client):
    payload = {
        "name": "Duplicate User",
        "email": "recruiter@resumematch.ai",
        "password": "password123",
        "role": "recruiter"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]
