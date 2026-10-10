from flask import Flask
from flask_cors import CORS

from config import config_map


def create_app(env: str = "development") -> Flask:
    """Flask application factory."""
    app = Flask(__name__, instance_relative_config=True)

    # Load config
    cfg = config_map.get(env, config_map["development"])
    app.config.from_object(cfg)

    # CORS — only allow the configured frontend origin(s)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Register blueprints
    from app.routes.health import health_bp
    from app.routes.explain_error import explain_error_bp
    from app.routes.mentor import mentor_bp
    from app.routes.guided_fix import guided_fix_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(explain_error_bp)
    app.register_blueprint(mentor_bp)
    app.register_blueprint(guided_fix_bp)

    # Global error handlers
    @app.errorhandler(404)
    def not_found(e):
        from flask import jsonify
        return jsonify({"error": "Not found", "code": "NOT_FOUND"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        from flask import jsonify
        return jsonify({"error": "Method not allowed", "code": "METHOD_NOT_ALLOWED"}), 405

    @app.errorhandler(500)
    def internal_error(e):
        from flask import jsonify
        return jsonify({"error": "Internal server error", "code": "INTERNAL"}), 500

    return app
