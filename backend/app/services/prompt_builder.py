"""
Builds system and user prompt strings for each feature.
Each function returns a (system_prompt, user_prompt) tuple.
"""

_SKILL_DESCRIPTORS = {
    "beginner": (
        "The user is a beginner with less than 6 months of programming experience. "
        "Explain everything in plain language. Avoid jargon. Define any technical terms you use."
    ),
    "intermediate": (
        "The user has basic programming experience and understands syntax and control flow. "
        "Be clear but do not over-explain fundamentals."
    ),
    "advanced": (
        "The user is an experienced developer. Be concise. Focus on root causes, "
        "edge cases, and best practices."
    ),
}

_JSON_INSTRUCTION = (
    "Respond ONLY with a valid JSON object. "
    "Do not include markdown code fences, prose, or any text outside the JSON."
)


def _skill(level: str) -> str:
    return _SKILL_DESCRIPTORS.get(level, _SKILL_DESCRIPTORS["intermediate"])


def build_explain_error_prompt(
    code: str,
    error_message: str,
    language: str,
    skill_level: str,
    learning_mode: bool,
) -> tuple[str, str]:
    hint_instruction = (
        'Set "hint" to a one-sentence clue that guides the user toward the fix '
        'without revealing it. Leave "suggested_fix" code and reasoning minimal if learning_mode is true.'
        if learning_mode
        else 'Set "hint" to null.'
    )

    system = (
        "You are an expert programming tutor specialising in debugging. "
        f"{_skill(skill_level)} "
        f"{_JSON_INSTRUCTION} "
        "The JSON must match exactly this schema: "
        '{"root_cause": {"confirmed": "string", "potential": ["string"]}, '
        '"explanation": "string", '
        '"relevant_lines": [integer], '
        '"suggested_fix": {"code": "string", "reasoning": "string"}, '
        '"hint": "string or null", '
        '"verification_steps": ["string"]} '
        "If you are not certain of the root cause, use the potential array "
        "instead of the confirmed field. Never claim a fix is tested."
        f" {hint_instruction}"
    )

    user = (
        f"Language: {language}\n\n"
        f"Code:\n---\n{code}\n---\n\n"
        f"Error message:\n{error_message or '(no error message provided)'}"
    )
    return system, user


def build_mentor_prompt(
    code: str,
    question: str,
    language: str,
    skill_level: str,
    learning_mode: bool,
) -> tuple[str, str]:
    hint_instruction = (
        "If learning_mode is true, encourage understanding by asking a guiding question "
        "in the follow_up_prompt field rather than giving a direct answer."
        if learning_mode
        else ""
    )

    system = (
        "You are an expert programming tutor. "
        f"{_skill(skill_level)} "
        f"{_JSON_INSTRUCTION} "
        "The JSON must match exactly this schema: "
        '{"blocks": [{"lines": "string", "explanation": "string", "concept": "string or null"}], '
        '"summary": "string", '
        '"follow_up_prompt": "string"} '
        "Explain the code by logical blocks. "
        "Encourage understanding rather than simply providing answers. "
        f"{hint_instruction}"
    )

    user = (
        f"Language: {language}\n\n"
        f"Code:\n---\n{code}\n---\n\n"
        f"Question: {question or 'Please explain this code.'}"
    )
    return system, user


def build_guided_fix_prompt(
    code: str,
    error_message: str,
    language: str,
    skill_level: str,
) -> tuple[str, str]:
    system = (
        "You are an expert programming tutor specialising in code correction. "
        f"{_skill(skill_level)} "
        f"{_JSON_INSTRUCTION} "
        "The JSON must match exactly this schema: "
        '{"original_code": "string", '
        '"fixed_code": "string", '
        '"changes": [{"line": integer, "original": "string", "fixed": "string", "reason": "string"}], '
        '"explanation": "string", '
        '"verification_steps": ["string"]} '
        "Never claim a fix has been tested or executed. "
        "Only list lines that actually changed in the changes array."
    )

    user = (
        f"Language: {language}\n\n"
        f"Code:\n---\n{code}\n---\n\n"
        f"Error message:\n{error_message or '(no error message provided)'}"
    )
    return system, user
