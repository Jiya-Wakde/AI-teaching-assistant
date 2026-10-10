"""
Parses and validates structured JSON responses from the AI client.
Raises ParseError with a descriptive message if validation fails.
"""
from __future__ import annotations

import json

from app.services.ai_client import ParseError


def _load(raw: str) -> dict:
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError) as e:
        raise ParseError(f"AI response is not valid JSON: {e}") from e


def _require(data: dict, *keys: str) -> None:
    missing = [k for k in keys if k not in data]
    if missing:
        raise ParseError(f"AI response missing required fields: {missing}")


def parse_explain_error(raw: str) -> dict:
    data = _load(raw)
    _require(data, "root_cause", "explanation", "suggested_fix", "verification_steps")
    _require(data["root_cause"], "confirmed", "potential")
    _require(data["suggested_fix"], "code", "reasoning")
    # Coerce types for safety
    if not isinstance(data["root_cause"]["potential"], list):
        data["root_cause"]["potential"] = []
    if not isinstance(data.get("relevant_lines", []), list):
        data["relevant_lines"] = []
    if not isinstance(data["verification_steps"], list):
        data["verification_steps"] = []
    data.setdefault("hint", None)
    return data


def parse_mentor(raw: str) -> dict:
    data = _load(raw)
    _require(data, "blocks", "summary", "follow_up_prompt")
    if not isinstance(data["blocks"], list):
        data["blocks"] = []
    for block in data["blocks"]:
        block.setdefault("concept", None)
    return data


def parse_guided_fix(raw: str) -> dict:
    data = _load(raw)
    _require(data, "original_code", "fixed_code", "changes", "explanation", "verification_steps")
    if not isinstance(data["changes"], list):
        data["changes"] = []
    if not isinstance(data["verification_steps"], list):
        data["verification_steps"] = []
    return data
