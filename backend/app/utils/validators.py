"""Input validators for all three API endpoints."""
from __future__ import annotations

from flask import current_app

VALID_LANGUAGES = {
    "python", "javascript", "typescript", "java", "c++", "c", "go",
    "rust", "sql", "html", "css", "bash", "other",
}
VALID_SKILL_LEVELS = {"beginner", "intermediate", "advanced"}


def _check_string(value, name: str, max_len: int) -> str | None:
    """Return an error string if invalid, else None."""
    if not isinstance(value, str):
        return f"'{name}' must be a string."
    if len(value) > max_len:
        return f"'{name}' exceeds the maximum length of {max_len} characters."
    return None


def validate_explain_error(data: dict) -> list[str]:
    errors = []
    max_code = current_app.config["MAX_CODE_LENGTH"]
    max_err = current_app.config["MAX_ERROR_LENGTH"]

    code = data.get("code", "")
    err = _check_string(code, "code", max_code)
    if err:
        errors.append(err)
    elif not code.strip():
        errors.append("'code' must not be empty.")

    if "error_message" in data:
        err = _check_string(data["error_message"], "error_message", max_err)
        if err:
            errors.append(err)

    lang = data.get("language", "").lower()
    if lang not in VALID_LANGUAGES:
        errors.append(f"'language' must be one of: {sorted(VALID_LANGUAGES)}.")

    skill = data.get("skill_level", "").lower()
    if skill not in VALID_SKILL_LEVELS:
        errors.append(f"'skill_level' must be one of: {sorted(VALID_SKILL_LEVELS)}.")

    return errors


def validate_mentor(data: dict) -> list[str]:
    errors = []
    max_code = current_app.config["MAX_CODE_LENGTH"]

    code = data.get("code", "")
    err = _check_string(code, "code", max_code)
    if err:
        errors.append(err)
    elif not code.strip():
        errors.append("'code' must not be empty.")

    if "question" in data:
        err = _check_string(data["question"], "question", 500)
        if err:
            errors.append(err)

    lang = data.get("language", "").lower()
    if lang not in VALID_LANGUAGES:
        errors.append(f"'language' must be one of: {sorted(VALID_LANGUAGES)}.")

    skill = data.get("skill_level", "").lower()
    if skill not in VALID_SKILL_LEVELS:
        errors.append(f"'skill_level' must be one of: {sorted(VALID_SKILL_LEVELS)}.")

    return errors


def validate_guided_fix(data: dict) -> list[str]:
    return validate_explain_error(data)  # same shape
