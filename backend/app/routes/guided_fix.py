from flask import Blueprint, request, jsonify

from app.services.ai_client import get_client, AIError, RateLimitError, AuthError, ParseError
from app.services.prompt_builder import build_guided_fix_prompt
from app.services.response_parser import parse_guided_fix
from app.utils.validators import validate_guided_fix
from app.utils.errors import make_error

guided_fix_bp = Blueprint("guided_fix", __name__)


@guided_fix_bp.route("/api/guided-fix", methods=["POST"])
def guided_fix():
    data = request.get_json(silent=True) or {}

    errors = validate_guided_fix(data)
    if errors:
        return make_error("VALIDATION_ERROR", "; ".join(errors), 400)

    code = data["code"]
    error_message = data.get("error_message", "")
    language = data.get("language", "python").lower()
    skill_level = data.get("skill_level", "intermediate").lower()

    try:
        client = get_client()
        system_prompt, user_prompt = build_guided_fix_prompt(
            code, error_message, language, skill_level
        )
        raw = client.complete(system_prompt, user_prompt, max_output_tokens=1400)
        result = parse_guided_fix(raw)
        return jsonify(result), 200

    except AuthError as e:
        return make_error("AUTH_ERROR", str(e), 503)
    except RateLimitError as e:
        return make_error("RATE_LIMIT", str(e), 429)
    except ParseError as e:
        return make_error("PARSE_ERROR", str(e), 502)
    except AIError as e:
        return make_error("AI_UNAVAILABLE", str(e), 503)
