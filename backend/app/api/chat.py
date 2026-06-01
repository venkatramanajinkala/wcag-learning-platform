"""
chat.py
-------
Main chat router.  Receives (session_id, message, debug?) from the frontend,
classifies intent, routes to the right handler, and returns a
ChatResponse with response text + optional rules_used + optional debug dict.

Intent taxonomy
───────────────
  greeting          – hi, hello, hey, how are you …
  weather           – weather in <city>
  current_leader    – who is the president/pm of <country>
  news              – news about <topic>
  sports            – score / game / match / standings …
  election          – election results, who won …
  wcag              – any accessibility / WCAG question
  general_chat      – everything else (→ Groq with no KB context)

All live-fact intents gracefully fall back if Google Search is not configured.
"""

from __future__ import annotations

import re
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.chat_memory import append_session_turn, get_session_history
from app.services.current_facts import (
    FactResult,
    get_current_leader,
    get_election,
    get_news,
    get_sports,
    get_weather,
)
from app.services.groq_client import ask_groq
from app.services.wcag_kb import get_wcag_rules

router = APIRouter(tags=["chat"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=2000)
    debug: bool = False        # if True, attach internal routing info to response


class RuleReference(BaseModel):
    id: str
    title: str


class ChatResponse(BaseModel):
    response: str
    rules_used: list[RuleReference] = []
    intent: str = ""           # always set; helps client-side debugging
    debug: dict[str, Any] | None = None   # only present when request.debug=True


# ---------------------------------------------------------------------------
# Intent detection
# ---------------------------------------------------------------------------

# Each entry: (intent_label, compiled_regex)
_INTENT_PATTERNS: list[tuple[str, re.Pattern]] = [
    # Greetings – must come before general_chat
    ("greeting", re.compile(
        r"^\s*(hi|hello|hey|howdy|greetings|good\s+(morning|afternoon|evening)|"
        r"what'?s\s+up|sup|how\s+are\s+you|how'?s\s+it\s+going)\b",
        re.IGNORECASE,
    )),

    # Weather – needs a city/place hint
    ("weather", re.compile(
        r"\b(weather|temperature|forecast|rain|snow|humid|wind|hot|cold|sunny|cloudy|"
        r"degrees|celsius|fahrenheit)\b.{0,80}\b(in|at|for|near)\b",
        re.IGNORECASE,
    )),
    # Also catch "weather in X" even without the second part
    ("weather", re.compile(
        r"\b(weather|forecast|temperature)\s+(in|at|for|near)\s+\w",
        re.IGNORECASE,
    )),

    # Current leader
    ("current_leader", re.compile(
        r"\b(who\s+is\s+(the\s+)?(current\s+)?(president|prime\s+minister|chancellor|"
        r"premier|leader|pm|ceo|head\s+of\s+(state|government))|"
        r"current\s+(president|prime\s+minister|chancellor|premier|leader)\s+of)\b",
        re.IGNORECASE,
    )),

    # Sports
    ("sports", re.compile(
        r"\b(score|scores|match|game|fixture|standings|league|tournament|"
        r"championship|nba|nfl|premier\s+league|fifa|nhl|mlb|f1|formula\s+one|"
        r"tennis|cricket|rugby|goal|won|lost|draw|result)\b",
        re.IGNORECASE,
    )),

    # Elections
    ("election", re.compile(
        r"\b(election|vote|voted|referendum|ballot|polling|won\s+the\s+election|"
        r"election\s+result|elected\s+president|elected\s+pm)\b",
        re.IGNORECASE,
    )),

    # News – broad, should come after more specific live-fact patterns
    ("news", re.compile(
        r"\b(news|latest|update|breaking|headline|what('?s|\s+is)\s+happening|"
        r"current\s+events|recent(ly)?|today'?s?)\b",
        re.IGNORECASE,
    )),

    # WCAG / Accessibility – very broad, last before general_chat
    ("wcag", re.compile(
        r"\b(wcag|accessibility|accessible|aria|screen\s+reader|color\s+contrast|"
        r"alt\s+text|alt\s+attribute|keyboard\s+(access|navigation|focus|trap)|"
        r"focus\s+(indicator|outline|visible|ring)|tabindex|semantic\s+html|"
        r"perceivable|operable|understandable|robust|criterion|criteria|"
        r"1\.\d+\.\d+|2\.\d+\.\d+|3\.\d+\.\d+|4\.\d+\.\d+|"
        r"caption|transcript|live\s+region|skip\s+(link|nav)|"
        r"button\s+(label|name)|form\s+(label|control)|"
        r"contrast\s+ratio|level\s+(a|aa|aaa))\b",
        re.IGNORECASE,
    )),
]


def _detect_intent(message: str) -> str:
    """Return the first matching intent label, or 'general_chat'."""
    for label, pattern in _INTENT_PATTERNS:
        if pattern.search(message):
            return label
    return "general_chat"


# ---------------------------------------------------------------------------
# Entity extraction helpers
# ---------------------------------------------------------------------------

_CITY_RE = re.compile(
    r"\b(?:weather|forecast|temperature)\s+(?:in|at|for|near)\s+([A-Za-z\s]{2,30}?)(?:\s*[?,!.]|$)",
    re.IGNORECASE,
)
_LEADER_COUNTRY_RE = re.compile(
    r"\b(?:president|prime\s+minister|chancellor|premier|leader|pm|"
    r"head\s+of\s+(?:state|government))\s+of\s+([A-Za-z\s]{2,30}?)(?:\s*[?,!.]|$)",
    re.IGNORECASE,
)
_LEADER_WHO_RE = re.compile(
    r"\bwho\s+is\s+(?:the\s+)?(?:current\s+)?(?:president|prime\s+minister|"
    r"chancellor|premier|leader|pm)\s+of\s+([A-Za-z\s]{2,30}?)(?:\s*[?,!.]|$)",
    re.IGNORECASE,
)
_LEADER_ROLE_RE = re.compile(
    r"\b(president|prime\s+minister|chancellor|premier|pm)\b",
    re.IGNORECASE,
)


def _extract_city(msg: str) -> str:
    m = _CITY_RE.search(msg)
    if m:
        return m.group(1).strip()
    # Fallback: last word-cluster after "in/at/for/near"
    m2 = re.search(r"\b(?:in|at|for|near)\s+([A-Za-z\s]{2,25})", msg, re.IGNORECASE)
    return m2.group(1).strip() if m2 else ""


def _extract_country_and_role(msg: str) -> tuple[str, str]:
    for pattern in (_LEADER_WHO_RE, _LEADER_COUNTRY_RE):
        m = pattern.search(msg)
        if m:
            country = m.group(1).strip()
            role_m = _LEADER_ROLE_RE.search(msg)
            role = role_m.group(1).strip() if role_m else "leader"
            return country, role
    return "", ""


def _extract_topic(msg: str, intent: str) -> str:
    """Best-effort topic extraction for news/sports/elections."""
    # Remove common filler phrases
    cleaned = re.sub(
        r"\b(what('?s)?|tell me|give me|latest|news|about|update|on|the|is there|"
        r"any|score|result|election|did|who|when|where)\b",
        " ", msg, flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip(" .,?!")
    return cleaned or msg[:60]


# ---------------------------------------------------------------------------
# Route handlers
# ---------------------------------------------------------------------------

def _handle_greeting(message: str, history: list) -> ChatResponse:
    """Simple, warm greeting – no LLM needed for basic hellos."""
    # For richer greetings ("how are you"), ask Groq
    if re.search(r"\b(how\s+are\s+you|how'?s\s+it|what'?s\s+up)\b", message, re.IGNORECASE):
        text = ask_groq(message, wcag_context=[], history=history)
    else:
        text = (
            "Hey! I'm your A11yPlay WCAG Assistant. "
            "Ask me about accessibility, WCAG criteria, live facts, weather, or anything else!"
        )
    return ChatResponse(response=text, intent="greeting")


def _handle_weather(message: str, history: list, dbg: bool) -> ChatResponse:
    city = _extract_city(message)
    if not city:
        return ChatResponse(
            response="Which city would you like the weather for?",
            intent="weather",
        )

    fact: FactResult = get_weather(city)

    if fact.success:
        # Let Groq rephrase into a conversational tone
        prompt = (
            f"The user asked: {message}\n\n"
            f"Live weather data: {fact.text}\n\n"
            "Reply naturally in 1–3 sentences. Include the key numbers. "
            "Mention the data is live."
        )
        response = ask_groq(prompt, wcag_context=[], history=history)
    else:
        response = fact.text  # already a user-friendly fallback

    return ChatResponse(
        response=response,
        intent="weather",
        debug=fact.debug if dbg else None,
    )


def _handle_current_leader(message: str, history: list, dbg: bool) -> ChatResponse:
    country, role = _extract_country_and_role(message)
    if not country:
        return ChatResponse(
            response="Which country are you asking about?",
            intent="current_leader",
        )

    fact: FactResult = get_current_leader(country, role)

    if fact.success:
        prompt = (
            f"The user asked: {message}\n\n"
            f"Live data: {fact.text}\n\n"
            "Answer naturally in 1–2 sentences. "
            "If the data says 'Based on recent sources', quote it carefully. "
            "Do not invent or guess names."
        )
        response = ask_groq(prompt, wcag_context=[], history=history)
    else:
        response = fact.text

    return ChatResponse(
        response=response,
        intent="current_leader",
        debug=fact.debug if dbg else None,
    )


def _handle_news(message: str, history: list, dbg: bool) -> ChatResponse:
    topic = _extract_topic(message, "news")
    fact = get_news(topic)
    return _live_fact_response("news", message, fact, history, dbg)


def _handle_sports(message: str, history: list, dbg: bool) -> ChatResponse:
    topic = _extract_topic(message, "sports")
    fact = get_sports(topic)
    return _live_fact_response("sports", message, fact, history, dbg)


def _handle_election(message: str, history: list, dbg: bool) -> ChatResponse:
    topic = _extract_topic(message, "election")
    fact = get_election(topic)
    return _live_fact_response("election", message, fact, history, dbg)


def _live_fact_response(
    kind: str, message: str, fact: FactResult, history: list, dbg: bool
) -> ChatResponse:
    if fact.success:
        prompt = (
            f"The user asked: {message}\n\n"
            f"Live {kind} data:\n{fact.text}\n\n"
            "Summarise this concisely in 2–4 sentences for the user. "
            "Keep source attributions if present. "
            "Do not invent facts not present in the data above."
        )
        response = ask_groq(prompt, wcag_context=[], history=history)
    else:
        response = fact.text

    return ChatResponse(
        response=response,
        intent=kind,
        debug=fact.debug if dbg else None,
    )


def _handle_wcag(message: str, history: list, dbg: bool) -> ChatResponse:
    matched_rules = get_wcag_rules(message)
    response = ask_groq(message, wcag_context=matched_rules, history=history)
    rules_used = [RuleReference(id=r["id"], title=r["title"]) for r in matched_rules]
    return ChatResponse(
        response=response,
        intent="wcag",
        rules_used=rules_used,
        debug={"matched_rules": [r["id"] for r in matched_rules]} if dbg else None,
    )


def _handle_general(message: str, history: list, dbg: bool) -> ChatResponse:
    response = ask_groq(message, wcag_context=[], history=history)
    return ChatResponse(response=response, intent="general_chat")


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    session_id = request.session_id.strip() or "default"
    message = request.message.strip()
    dbg = request.debug

    history = get_session_history(session_id)
    intent = _detect_intent(message)

    dispatch = {
        "greeting":       lambda: _handle_greeting(message, history),
        "weather":        lambda: _handle_weather(message, history, dbg),
        "current_leader": lambda: _handle_current_leader(message, history, dbg),
        "news":           lambda: _handle_news(message, history, dbg),
        "sports":         lambda: _handle_sports(message, history, dbg),
        "election":       lambda: _handle_election(message, history, dbg),
        "wcag":           lambda: _handle_wcag(message, history, dbg),
        "general_chat":   lambda: _handle_general(message, history, dbg),
    }

    result: ChatResponse = dispatch.get(intent, dispatch["general_chat"])()

    # Always tag the intent even if the handler didn't set it
    if not result.intent:
        result.intent = intent

    # Update session memory
    append_session_turn(session_id, "user", message)
    append_session_turn(session_id, "assistant", result.response)

    return result