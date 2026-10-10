"""
Gemini AI client.
Wraps google-generativeai and maps SDK exceptions to typed internal errors.
"""
import os
from typing import Optional

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions


class AIError(Exception):
    """Base class for all AI client errors."""
    code = "AI_UNAVAILABLE"


class RateLimitError(AIError):
    code = "RATE_LIMIT"


class AuthError(AIError):
    code = "AUTH_ERROR"


class ParseError(AIError):
    code = "PARSE_ERROR"


class GeminiClient:
    """Thread-safe Gemini client. Instantiate once at app startup."""

    def __init__(self, api_key: str, model_name: str):
        if not api_key:
            raise AuthError(
                "GEMINI_API_KEY is not set. "
                "Copy backend/.env.example to backend/.env and add your key."
            )
        genai.configure(api_key=api_key)
        self._model_name = model_name
        self._generation_config = genai.types.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.2,
        )

    def complete(self, system_prompt: str, user_prompt: str, max_output_tokens: int = 1200) -> str:
        """
        Send a request to Gemini and return the raw response text.
        Raises AIError subclasses on failure.
        """
        generation_config = genai.types.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.2,
            max_output_tokens=max_output_tokens,
        )
        model = genai.GenerativeModel(
            model_name=self._model_name,
            generation_config=generation_config,
            system_instruction=system_prompt,
        )
        try:
            response = model.generate_content(user_prompt)
            return response.text
        except google_exceptions.ResourceExhausted as e:
            raise RateLimitError(
                "Gemini API quota or rate limit reached. Please wait and try again."
            ) from e
        except google_exceptions.Unauthenticated as e:
            raise AuthError(
                "Gemini API key is invalid or expired. Check GEMINI_API_KEY in backend/.env."
            ) from e
        except google_exceptions.InvalidArgument as e:
            raise AIError(f"Invalid request to Gemini API: {e}") from e
        except google_exceptions.ServiceUnavailable as e:
            raise AIError("Gemini API is temporarily unavailable.") from e
        except Exception as e:
            raise AIError(f"Unexpected error calling Gemini API: {e}") from e


# Module-level singleton — created lazily on first use so tests can run without a key
_client: Optional[GeminiClient] = None


def get_client() -> GeminiClient:
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        _client = GeminiClient(api_key=api_key, model_name=model_name)
    return _client


def reset_client() -> None:
    """For use in tests to reset the singleton between cases."""
    global _client
    _client = None
