from flask import Blueprint, request, jsonify

from app.services.ai_client import get_client, AIError, RateLimitError, AuthError, ParseError
from app.services.prompt_builder import build_explain_error_prompt
from app.services.response_parser import parse_explain_error
from app.utils.validators import validate_explain_error
from app.utils.errors import make_error

explain_error_bp = Blueprint("explain_error", __name__)


@explain_error_bp.route("/api/explain-error", methods=["POST"])
def explain_error():
    data = request.get_json(silent=True) or {}

    errors = validate_explain_error(data)
    if errors:
        return make_error("VALIDATION_ERROR", "; ".join(errors), 400)

    code = data["code"]
    error_message = data.get("error_message", "")
    language = data.get("language", "python").lower()
    skill_level = data.get("skill_level", "intermediate").lower()
    learning_mode = bool(data.get("learning_mode", False))

    try:
        client = get_client()
        system_prompt, user_prompt = build_explain_error_prompt(
            code, error_message, language, skill_level, learning_mode
        )
        raw = client.complete(system_prompt, user_prompt)
        result = parse_explain_error(raw)
        return jsonify(result), 200

    except AuthError as e:
        return make_error("AUTH_ERROR", str(e), 503)
    except RateLimitError as e:
        return make_error("RATE_LIMIT", str(e), 429)
    except ParseError as e:
        return make_error("PARSE_ERROR", str(e), 502)
    except AIError as e:
        return make_error("AI_UNAVAILABLE", str(e), 503)
