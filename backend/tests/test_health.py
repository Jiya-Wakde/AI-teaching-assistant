"""Tests for GET /api/health endpoint."""
import json


def test_health_returns_200(client):
    response = client.get("/api/health")
    assert response.status_code == 200


def test_health_content_type_is_json(client):
    response = client.get("/api/health")
    assert response.content_type == "application/json"


def test_health_body_has_status_ok(client):
    response = client.get("/api/health")
    data = json.loads(response.data)
    assert data["status"] == "ok"


def test_health_body_has_provider_gemini(client):
    response = client.get("/api/health")
    data = json.loads(response.data)
    assert data["provider"] == "gemini"


def test_health_body_has_model_field(client):
    response = client.get("/api/health")
    data = json.loads(response.data)
    assert "model" in data
    assert isinstance(data["model"], str)
    assert len(data["model"]) > 0


def test_health_model_matches_env(client, app):
    """The model field should reflect the GEMINI_MODEL env var."""
    response = client.get("/api/health")
    data = json.loads(response.data)
    assert data["model"] == app.config["GEMINI_MODEL"]


def test_health_post_returns_405(client):
    """Health endpoint should not accept POST."""
    response = client.post("/api/health")
    assert response.status_code == 405


def test_unknown_route_returns_404(client):
    response = client.get("/api/does-not-exist")
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data["code"] == "NOT_FOUND"
