import requests
from fastapi import HTTPException, status

from app.core.config import get_settings


SYSTEM_PROMPT = (
    "You are an expert accessibility engineer. "
    "You help users fix WCAG issues in simple language."
)


def ask_groq(message: str, wcag_context: list[str]) -> str:
    settings = get_settings()
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Groq API is not configured. Set GROQ_API_KEY.",
        )

    context_text = "\n".join(f"- {rule}" for rule in wcag_context) or "No direct WCAG rule matched."
    user_prompt = (
        "User question:\n"
        f"{message}\n\n"
        "WCAG context from wcag.json:\n"
        f"{context_text}\n\n"
        "Answer with practical steps. Reference the WCAG rules used when helpful."
    )

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": settings.groq_model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 700,
        },
        timeout=30,
    )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq request failed with status {response.status_code}.",
        )

    data = response.json()
    return data["choices"][0]["message"]["content"].strip()
