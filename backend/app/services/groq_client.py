import requests
from fastapi import HTTPException, status

from app.core.config import get_settings


SYSTEM_PROMPT = """
You are A11yPlay WCAG Assistant, a concise accessibility tutor for developers.

Hard rules:
- Answer only using the provided WCAG context and the user's question.
- Do not invent standards, numbers, or rules that are not in the context.
- If the context is empty or no relevant rule is found, say exactly: "No exact WCAG rule matched, giving general accessibility guidance."
- Keep the answer short: 4 sections max, plain language, no preamble, no filler.
- Prefer practical fixes over theory.
- If the user asks for a code example, give one only when it is genuinely helpful and keep it small.

Preferred output structure:
Issue:
Rule:
Fix:
Example:
"""


def _build_user_prompt(message: str, wcag_context: list[str]) -> str:
    if wcag_context:
        context_text = "\n\n".join(
            f"Rule {index + 1}:\n{rule}" for index, rule in enumerate(wcag_context)
        )
    else:
        context_text = "No exact WCAG rule matched, giving general accessibility guidance."

    return f"""
User question:
{message}

WCAG context:
{context_text}

Write a short, practical answer for a developer or learner.
Use only the context above as the source of truth.
If there is no context, use the exact fallback sentence from the system rules and then give general accessibility guidance.
"""


def ask_groq(message: str, wcag_context: list[str]) -> str:
    settings = get_settings()

    if not settings.groq_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Groq API is not configured. Set GROQ_API_KEY.",
        )

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.groq_model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT.strip()},
                    {"role": "user", "content": _build_user_prompt(message, wcag_context).strip()},
                ],
                "temperature": 0.05,
                "max_tokens": 260,
                "top_p": 0.8,
            },
            timeout=30,
        )

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq API error: {response.text}",
            )

        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

    except requests.RequestException as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq connection error: {error}",
        )
