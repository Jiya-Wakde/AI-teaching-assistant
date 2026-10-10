import os


class Config:
    """Base configuration loaded from environment variables."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")

    # Gemini AI provider
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")

    # SQLite database stored in the instance folder (gitignored)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "sqlite:///app.db",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Input size limits
    MAX_CODE_LENGTH = int(os.environ.get("MAX_CODE_LENGTH", 8000))
    MAX_ERROR_LENGTH = int(os.environ.get("MAX_ERROR_LENGTH", 2000))

    # CORS: comma-separated allowed origins
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
