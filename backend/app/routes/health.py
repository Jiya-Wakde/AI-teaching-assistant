from flask import Blueprint, jsonify, current_app

health_bp = Blueprint("health", __name__)


@health_bp.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint. Returns provider and model configuration."""
    return jsonify(
        {
            "status": "ok",
            "provider": "gemini",
            "model": current_app.config.get("GEMINI_MODEL", "not configured"),
        }
    ), 200
