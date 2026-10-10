"""Centralised error response helper."""
from flask import jsonify


def make_error(code: str, message: str, http_status: int):
    return jsonify({"error": message, "code": code}), http_status
