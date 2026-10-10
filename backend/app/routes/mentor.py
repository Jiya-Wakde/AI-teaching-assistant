from flask import Blueprint, request, jsonify

from app.services.ai_client import get_client, AIError, RateLimitError, AuthError, ParseError
from app.services.prompt_builder import build_mentor_prompt
from app.services.response_parser import parse_mentor
from app.utils.validators import validate_mentor
from app.utils.errors import make_error

mentor_bp = Blueprint("mentor", __name__)


@mentor_bp.route("/api/mentor", methods=["POST"])
def mentor():
    data = request.get_json(silent=True) or {}

    errors = validate_mentor(data)
    if errors:
        return make_error("VALIDATION_ERROR", "; ".join(errors), 400)

    code = data["code"]
    question = data.get("question", "")
    language = data.get("language", "python").lower()
    skill_level = data.get("skill_level", "intermediate").lower()
    learning_mode = bool(data.get("learning_mode", False))

    try:
        client = get_client()
        system_prompt, user_prompt = build_mentor_prompt(
            code, question, language, skill_level, learning_mode
        )
        raw = client.complete(system_prompt, user_prompt, max_output_tokens=1400)
        result = parse_mentor(raw)
        return jsonify(result), 200

    except AuthError as e:
        return make_error("AUTH_ERROR", str(e), 503)
    except RateLimitError as e:
        return make_error("RATE_LIMIT", str(e), 429)
    except ParseError as e:
        return make_error("PARSE_ERROR", str(e), 502)
    except AIError as e:
        return make_error("AI_UNAVAILABLE", str(e), 503)
