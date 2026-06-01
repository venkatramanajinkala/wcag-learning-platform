"""
groq_client.py
--------------
Groq LLM wrapper.

ask_groq() is used for:
  1. Pure WCAG Q&A (wcag_context is populated)
  2. Live-fact rephrasing (wcag_context empty, message contains live data)
  3. General conversation (wcag_context empty)

The function never tries to answer from its own training data for
live-fact queries – that data is injected into the prompt by the caller.
"""

from __future__ import annotations

import requests
from fastapi import HTTPException, status

from app.core.config import get_settings


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """
You are A11yPlay WCAG Assistant – a concise, developer-friendly accessibility guide.

CORE RULES:
1. Answer directly and conversationally. Never use robotic templates like "Issue: / Fix: / Rule:".
2. Keep replies under 130 words unless the user explicitly asks for more detail.
3. For WCAG questions, mention only the relevant criterion briefly.  Never dump full WCAG documentation.
4. For live-fact questions, if data is injected in the prompt, use ONLY that data.
   - Do NOT add, invent, or guess any facts not present in the injected data.
   - If the data says "I couldn't verify", pass that message on honestly.
5. For casual greetings or off-topic questions, respond naturally and briefly.
6. Never say "No exact WCAG rule matched" – either cite a rule briefly or skip the rule reference.
7. Tone: friendly, expert, concise, practical.

LIVE DATA HANDLING:
When the prompt contains a "Live weather data:", "Live news data:", or similar section,
your job is to rephrase that data naturally – not to add knowledge from your training.
""".strip()


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def ask_groq(
    message: str,
    wcag_context: list[dict[str, str]],
    *,
    history: list[dict[str, str]] | None = None,
) -> str:
    """
    Send a message to Groq and return the assistant's reply.

    Parameters
    ----------
    message      : The user message (may already contain injected live data).
    wcag_context : List of matching WCAG rules dicts with 'id', 'title', 'summary'.
    history      : Recent chat turns for multi-turn context.
    """
    settings = get_settings()

    if not settings.groq_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Groq API is not configured. Set GROQ_API_KEY in .env.",
        )

    user_content = _build_user_content(message, wcag_context)
    history_messages = _sanitise_history(history or [])

    payload = {
        "model": settings.groq_model,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            *history_messages,
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.25,       # slightly higher → more natural rephrasing
        "max_tokens": 280,
        "top_p": 0.85,
    }

    try:
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )
        if resp.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq API error {resp.status_code}: {resp.text[:200]}",
            )
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()

    except requests.Timeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Groq API timed out. Please try again.",
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq connection error: {exc}",
        )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _build_user_content(message: str, wcag_context: list[dict[str, str]]) -> str:
    """
    If wcag_context is populated, append a concise KB block.
    If the message already contains injected live data (from current_facts.py),
    pass it through verbatim – the live data IS the context.
    """
    if not wcag_context:
        # No KB context: message may already contain live data injected by chat.py
        return message

    context_lines = "\n".join(
        f"- {r['id']} | {r['title']}: {r['summary']}"
        for r in wcag_context
    )

    return (
        f"{message}\n\n"
        f"Relevant WCAG context (use only if helpful):\n{context_lines}\n\n"
        "Answer the question directly. Cite at most one criterion briefly if relevant."
    )


def _sanitise_history(history: list[dict[str, str]]) -> list[dict[str, str]]:
    """Keep only valid role/content pairs; truncate to last 8 turns."""
    valid = [
        {"role": t["role"], "content": t["content"]}
        for t in history
        if t.get("role") in {"user", "assistant"} and t.get("content")
    ]
    return valid[-8:]