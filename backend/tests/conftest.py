import os
import sys
import pytest

# Ensure the backend root is on the path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Set minimal env vars so the app factory doesn't complain about missing config
os.environ.setdefault("GEMINI_API_KEY", "test-key-placeholder")
os.environ.setdefault("GEMINI_MODEL", "gemini-1.5-flash")
os.environ.setdefault("FLASK_ENV", "development")


@pytest.fixture
def app():
    from app import create_app
    application = create_app("development")
    application.config["TESTING"] = True
    return application


@pytest.fixture
def client(app):
    return app.test_client()
