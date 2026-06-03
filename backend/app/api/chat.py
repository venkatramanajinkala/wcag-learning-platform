"""
chat.py
-------
Main chat router. Receives (session_id, message, debug?) from the frontend,
classifies intent, routes to the right handler, and returns a ChatResponse.

Live-fact handlers only answer from injected live data. If live search is not
configured, they return honest fallback responses instead of guessing.
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
    get_wcag_live,
)
from app.services.groq_client import ask_groq
from app.services.wcag_kb import get_wcag_rules

router = APIRouter(tags=["chat"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class SearchSource(BaseModel):
    title: str
    url: str
    domain: str


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=2000)
    debug: bool = False


class RuleReference(BaseModel):
    id: str
    title: str


class ChatResponse(BaseModel):
    response: str
    rules_used: list[RuleReference] = []
    intent: str = ""
    search_used: bool = False
    sources: list[SearchSource] = []
    answer_confidence: str = "kb"
    debug: dict[str, Any] | None = None


# ---------------------------------------------------------------------------
# Intent detection
# ---------------------------------------------------------------------------

_INTENT_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("greeting", re.compile(
        r"^\s*(hi|hello|hey|howdy|greetings|good\s+(morning|afternoon|evening)|"
        r"what'?s\s+up|sup|how\s+are\s+you|how'?s\s+it\s+going)\b",
        re.IGNORECASE,
    )),
    ("weather", re.compile(
        r"\b(weather|temperature|forecast|rain|snow|humid|wind|hot|cold|sunny|cloudy|"
        r"degrees|celsius|fahrenheit)\b.{0,80}\b(in|at|for|near)\b",
        re.IGNORECASE,
    )),
    ("weather", re.compile(
        r"\b(weather|forecast|temperature)\s+(in|at|for|near)\s+\w",
        re.IGNORECASE,
    )),
    ("current_leader", re.compile(
        r"\b(who\s+is\s+(the\s+)?(current\s+)?(president|prime\s+minister|chancellor|"
        r"premier|leader|pm|ceo|head\s+of\s+(state|government))|"
        r"current\s+(president|prime\s+minister|chancellor|premier|leader)\s+of)\b",
        re.IGNORECASE,
    )),
    ("sports", re.compile(
        r"\b(score|scores|match|game|fixture|standings|league|tournament|"
        r"championship|nba|nfl|premier\s+league|fifa|nhl|mlb|f1|formula\s+one|"
        r"tennis|cricket|rugby|goal|won|lost|draw|result)\b",
        re.IGNORECASE,
    )),
    ("election", re.compile(
        r"\b(election|vote|voted|referendum|ballot|polling|won\s+the\s+election|"
        r"election\s+result|elected\s+president|elected\s+pm)\b",
        re.IGNORECASE,
    )),
    ("news", re.compile(
        r"\b(news|latest|update|breaking|headline|what('?s|\s+is)\s+happening|"
        r"current\s+events|recent(ly)?|today'?s?)\b",
        re.IGNORECASE,
    )),
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

_LIVE_SIGNAL_RE = re.compile(
    r"\b(latest|current|2024|2025|2026|new|recently|"
    r"just\s+released|still|now|today|this\s+year|"
    r"updated|version|what.s\s+new)\b",
    re.IGNORECASE,
)


def _detect_intent(message: str) -> str:
    """Return the first matching intent label, or 'general_chat'."""
    for label, pattern in _INTENT_PATTERNS:
        if pattern.search(message):
            return label
    return "general_chat"


def _needs_live_verification(message: str) -> bool:
    return bool(_LIVE_SIGNAL_RE.search(message))


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
    cleaned = re.sub(
        r"\b(what('?s)?|tell me|give me|latest|news|about|update|on|the|is there|"
        r"any|score|result|election|did|who|when|where)\b",
        " ", msg, flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip(" .,?!")
    return cleaned or msg[:60]


def _build_sources(fact: "FactResult") -> list["SearchSource"]:
    sources = []
    debug = getattr(fact, "debug", {}) or {}
    raw_source = getattr(fact, "source", "") or ""

    if raw_source and raw_source not in ("open-meteo.com", "google-search", ""):
        sources.append(SearchSource(title="Search result", url="", domain=raw_source))

    if raw_source == "open-meteo.com":
        sources.append(SearchSource(
            title="Open-Meteo Weather API",
            url="https://open-meteo.com",
            domain="open-meteo.com",
        ))
    elif raw_source == "google-search":
        sources.append(SearchSource(
            title="Google Search",
            url="",
            domain="google.com",
        ))

    return sources


def _live_search_disabled_response(intent: str, message: str) -> ChatResponse:
    if intent == "news":
        response = (
            "Live search isn't configured right now. "
            "For current news, please check a reliable news source directly."
        )
    elif intent == "weather":
        response = (
            "I don't have access to live search right now. "
            "Please check a reliable weather source for current conditions."
        )
    else:
        response = (
            "I don't have access to live search right now. "
            "Please check a reliable source for current information."
        )
    return ChatResponse(
        response=response,
        intent=intent,
        search_used=False,
        answer_confidence="fallback",
    )


# ---------------------------------------------------------------------------
# Route handlers
# ---------------------------------------------------------------------------

def _handle_greeting(message: str, history: list) -> ChatResponse:
    """Simple, warm greeting - no LLM needed for basic hellos."""
    if re.search(r"\b(how\s+are\s+you|how'?s\s+it|what'?s\s+up)\b", message, re.IGNORECASE):
        text = ask_groq(message, wcag_context=[], history=history)
    else:
        text = (
            "Hey! I'm your A11yPlay WCAG Assistant. "
            "Ask me about accessibility, WCAG criteria, live facts, weather, or anything else!"
        )
    return ChatResponse(response=text, intent="greeting", answer_confidence="training")


def _handle_weather(message: str, history: list, dbg: bool) -> ChatResponse:
    from app.core.config import get_settings
    if not get_settings().live_search_enabled:
        return _live_search_disabled_response("weather", message)

    city = _extract_city(message)
    if not city:
        return ChatResponse(
            response="Which city would you like the weather for?",
            intent="weather",
            answer_confidence="fallback",
        )

    fact: FactResult = get_weather(city)

    if fact.success:
        prompt = (
            f"The user asked: {message}\n\n"
            f"Live weather data: {fact.text}\n\n"
            "Reply naturally in 1-3 sentences. Include the key numbers. "
            "Mention the data is live."
        )
        response = ask_groq(prompt, wcag_context=[], history=history)
    else:
        response = fact.text

    return ChatResponse(
        response=response,
        intent="weather",
        search_used=fact.success,
        sources=_build_sources(fact) if fact.success else [],
        answer_confidence="live" if fact.success else "fallback",
        debug=fact.debug if dbg else None,
    )


def _handle_current_leader(message: str, history: list, dbg: bool) -> ChatResponse:
    from app.core.config import get_settings
    if not get_settings().live_search_enabled:
        return _live_search_disabled_response("current_leader", message)

    country, role = _extract_country_and_role(message)
    if not country:
        return ChatResponse(
            response="Which country are you asking about?",
            intent="current_leader",
            answer_confidence="fallback",
        )

    fact: FactResult = get_current_leader(country, role)

    if fact.success:
        prompt = (
            f"The user asked: {message}\n\n"
            f"Live data: {fact.text}\n\n"
            "Answer naturally in 1-2 sentences. "
            "If the data says 'Based on recent sources', quote it carefully. "
            "Do not invent or guess names."
        )
        response = ask_groq(prompt, wcag_context=[], history=history)
    else:
        response = fact.text

    return ChatResponse(
        response=response,
        intent="current_leader",
        search_used=fact.success,
        sources=_build_sources(fact) if fact.success else [],
        answer_confidence="live" if fact.success else "fallback",
        debug=fact.debug if dbg else None,
    )


def _handle_news(message: str, history: list, dbg: bool) -> ChatResponse:
    from app.core.config import get_settings
    if not get_settings().live_search_enabled:
        return _live_search_disabled_response("news", message)

    topic = _extract_topic(message, "news")
    fact = get_news(topic)
    result = _live_fact_response("news", message, fact, history, dbg)
    result.search_used = fact.success
    result.answer_confidence = "live" if fact.success else "fallback"
    result.sources = _build_sources(fact) if fact.success else []
    return result


def _handle_sports(message: str, history: list, dbg: bool) -> ChatResponse:
    from app.core.config import get_settings
    if not get_settings().live_search_enabled:
        return _live_search_disabled_response("sports", message)

    topic = _extract_topic(message, "sports")
    fact = get_sports(topic)
    result = _live_fact_response("sports", message, fact, history, dbg)
    result.search_used = fact.success
    result.answer_confidence = "live" if fact.success else "fallback"
    result.sources = _build_sources(fact) if fact.success else []
    return result


def _handle_election(message: str, history: list, dbg: bool) -> ChatResponse:
    from app.core.config import get_settings
    if not get_settings().live_search_enabled:
        return _live_search_disabled_response("election", message)

    topic = _extract_topic(message, "election")
    fact = get_election(topic)
    result = _live_fact_response("election", message, fact, history, dbg)
    result.search_used = fact.success
    result.answer_confidence = "live" if fact.success else "fallback"
    result.sources = _build_sources(fact) if fact.success else []
    return result


def _live_fact_response(
    kind: str, message: str, fact: FactResult, history: list, dbg: bool
) -> ChatResponse:
    if fact.success:
        prompt = (
            f"The user asked: {message}\n\n"
            f"Live {kind} data:\n{fact.text}\n\n"
            "Summarise this concisely in 2-4 sentences for the user. "
            "Keep source attributions if present. "
            "Do not invent facts not present in the data above."
        )
        response = ask_groq(prompt, wcag_context=[], history=history)
    else:
        response = fact.text

    return ChatResponse(
        response=response,
        intent=kind,
        search_used=fact.success,
        sources=_build_sources(fact) if fact.success else [],
        answer_confidence="live" if fact.success else "fallback",
        debug=fact.debug if dbg else None,
    )


def _handle_wcag(message: str, history: list, dbg: bool) -> ChatResponse:
    from app.core.config import get_settings

    matched_rules = get_wcag_rules(message)
    sources: list[SearchSource] = []
    search_used = False
    live_context = ""

    if _needs_live_verification(message) or not matched_rules:
        if get_settings().live_search_enabled:
            fact = get_wcag_live(message)
            if fact.success:
                live_context = fact.text
                search_used = True
                sources = _build_sources(fact)

    if live_context and matched_rules:
        context_lines = "\n".join(
            f"- {r['id']} | {r['title']}: {r['summary']}"
            for r in matched_rules
        )
        prompt = (
            f"{message}\n\n"
            f"WCAG Knowledge Base context:\n{context_lines}\n\n"
            f"Live search data (authoritative, use this for current facts):\n{live_context}\n\n"
            "Answer using both sources. Cite the WCAG criterion briefly if relevant. "
            "Prioritise live data for any version-specific or current information."
        )
    elif live_context:
        prompt = (
            f"{message}\n\n"
            f"Live search data:\n{live_context}\n\n"
            "Answer based on this live data only. Do not add information from training."
        )
    elif matched_rules:
        context_lines = "\n".join(
            f"- {r['id']} | {r['title']}: {r['summary']}"
            for r in matched_rules
        )
        prompt = (
            f"{message}\n\n"
            f"Relevant WCAG context:\n{context_lines}\n\n"
            "Answer directly. Cite at most one criterion briefly if relevant."
        )
    else:
        prompt = (
            f"{message}\n\n"
            "LIVE DATA MISSING. Answer only what you know from WCAG training. "
            "If this is a current-version or recent-update question, say you cannot verify "
            "the latest information and direct the user to w3.org."
        )

    response = ask_groq(prompt, wcag_context=[], history=history)
    rules_used = [RuleReference(id=r["id"], title=r["title"]) for r in matched_rules]
    confidence = "live" if search_used else ("kb" if matched_rules else "training")

    return ChatResponse(
        response=response,
        intent="wcag",
        rules_used=rules_used,
        search_used=search_used,
        sources=sources,
        answer_confidence=confidence,
        debug={"matched_rules": [r["id"] for r in matched_rules], "live_used": search_used} if dbg else None,
    )


def _handle_general(message: str, history: list, dbg: bool) -> ChatResponse:
    response = ask_groq(message, wcag_context=[], history=history)
    return ChatResponse(response=response, intent="general_chat", answer_confidence="training")


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

    if not result.intent:
        result.intent = intent

    append_session_turn(session_id, "user", message)
    append_session_turn(session_id, "assistant", result.response)

    return result
