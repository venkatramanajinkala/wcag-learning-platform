import requests
from fastapi import HTTPException, status

from app.core.config import get_settings


SYSTEM_PROMPT = """
You are A11yPlay WCAG Assistant.

You are a smart accessibility engineer assistant helping developers understand and fix WCAG accessibility issues.

IMPORTANT RULES:

* Always answer directly first.
* Keep responses concise and useful.
* Avoid long essays unless user requests deep explanation.
* Never dump huge WCAG documentation.
* Never use robotic templates like:
  Issue:
  Fix:
  Rule:
* Never say:
  'No exact WCAG rule matched'
* Mention only relevant WCAG criteria briefly, and never repeat the full WCAG text.
* Use practical developer-friendly examples.
* Respond naturally like ChatGPT.
* If user greets casually, respond casually.
* If question is unrelated to accessibility, answer normally.

Your tone:

* friendly
* concise
* expert
* practical
"""


def _build_user_prompt(message: str, wcag_context: list[dict[str, str]]) -> str:
    if wcag_context:
        context_text = "\n".join(
            f"- {rule['id']} | {rule['title']} | {rule['summary']}"
            for rule in wcag_context
        )
    else:
        context_text = "(none matched)"

    return f"""
Current user question:
{message}

WCAG context:
{context_text}

Answer the current question directly and naturally.
Keep the reply under 120 words unless the user asks for more detail.
Use the chat history when the user refers back to earlier criteria or says things like "the second one" or "explain more".
If there is WCAG context, mention only the relevant criteria briefly and do not restate the rule summaries.
If there is no WCAG context, still answer normally and helpfully without forcing a WCAG rule.
"""


def ask_groq(
    message: str,
    wcag_context: list[dict[str, str]],
    history: list[dict[str, str]] | None = None,
) -> str:
    settings = get_settings()

    if not settings.groq_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Groq API is not configured. Set GROQ_API_KEY.",
        )

    history_messages = [
        {"role": turn["role"], "content": turn["content"]}
        for turn in (history or [])
        if turn.get("role") in {"user", "assistant"} and turn.get("content")
    ]

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
                    *history_messages,
                    {"role": "user", "content": _build_user_prompt(message, wcag_context).strip()},
                ],
                "temperature": 0.2,
                "max_tokens": 250,
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
