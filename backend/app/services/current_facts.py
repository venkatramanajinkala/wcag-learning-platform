"""
current_facts.py
----------------
Deterministic live-fact handlers:
  - weather   → Open-Meteo (free, no key required)
  - leader    → Google Custom Search + regex extraction
  - news      → Google Custom Search summary
  - sports    → Google Custom Search summary
  - elections → Google Custom Search summary

All public functions return a FactResult so chat.py can decide
whether to pass the text to Groq for rephrasing or return it directly.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

import requests

from app.services.google_search import (
    SearchResponse,
    search_current_leader,
    search_election,
    search_news,
    search_sports,
)


# ---------------------------------------------------------------------------
# Shared result type
# ---------------------------------------------------------------------------

@dataclass
class FactResult:
    success: bool
    text: str                          # human-readable answer (may be partial)
    source: str = ""                   # e.g. "open-meteo.com", "google-search"
    debug: dict[str, Any] = field(default_factory=dict)


_FALLBACK_TEXT = (
    "I wasn't able to verify that live information right now. "
    "Please check a reliable news source or official website for the latest details."
)


# ---------------------------------------------------------------------------
# 1. WEATHER  (Open-Meteo – no API key needed)
# ---------------------------------------------------------------------------

# WMO weather code → plain-English description
_WMO_CODES: dict[int, str] = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Icy fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
}

# Geocoding: well-known cities → (lat, lon) to avoid a round-trip to a geo API
_CITY_COORDS: dict[str, tuple[float, float]] = {
    "london":         (51.5074, -0.1278),
    "new york":       (40.7128, -74.0060),
    "new york city":  (40.7128, -74.0060),
    "nyc":            (40.7128, -74.0060),
    "paris":          (48.8566, 2.3522),
    "tokyo":          (35.6895, 139.6917),
    "sydney":         (-33.8688, 151.2093),
    "dubai":          (25.2048, 55.2708),
    "mumbai":         (19.0760, 72.8777),
    "delhi":          (28.6139, 77.2090),
    "beijing":        (39.9042, 116.4074),
    "singapore":      (1.3521, 103.8198),
    "cairo":          (30.0444, 31.2357),
    "berlin":         (52.5200, 13.4050),
    "toronto":        (43.6532, -79.3832),
    "chicago":        (41.8781, -87.6298),
    "los angeles":    (34.0522, -118.2437),
    "la":             (34.0522, -118.2437),
    "san francisco":  (37.7749, -122.4194),
    "sf":             (37.7749, -122.4194),
    "seattle":        (47.6062, -122.3321),
    "miami":          (25.7617, -80.1918),
    "moscow":         (55.7558, 37.6176),
    "istanbul":       (41.0082, 28.9784),
    "seoul":          (37.5665, 126.9780),
    "bangkok":        (13.7563, 100.5018),
    "jakarta":        (-6.2088, 106.8456),
    "lagos":          (6.5244, 3.3792),
    "nairobi":        (-1.2921, 36.8219),
    "buenos aires":   (-34.6037, -58.3816),
    "sao paulo":      (-23.5505, -46.6333),
    "mexico city":    (19.4326, -99.1332),
    "amsterdam":      (52.3676, 4.9041),
    "rome":           (41.9028, 12.4964),
    "madrid":         (40.4168, -3.7038),
    "chennai":        (13.0827, 80.2707),
    "bangalore":      (12.9716, 77.5946),
    "hyderabad":      (17.3850, 78.4867),
    "kolkata":        (22.5726, 88.3639),
}


def _geocode(city: str) -> tuple[float, float] | None:
    """Return (lat, lon) for a city name. Tries cache first, then Open-Meteo geocoding."""
    key = city.lower().strip()
    if key in _CITY_COORDS:
        return _CITY_COORDS[key]

    # Fallback: Open-Meteo geocoding (free)
    try:
        resp = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": city, "count": 1, "language": "en", "format": "json"},
            timeout=5,
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])
        if results:
            r = results[0]
            return float(r["latitude"]), float(r["longitude"])
    except Exception:
        pass
    return None


def get_weather(city: str) -> FactResult:
    """Fetch current weather for *city* from Open-Meteo."""
    coords = _geocode(city)
    if not coords:
        return FactResult(
            success=False,
            text=f"I couldn't find the location '{city}'. Please try a major city name.",
            source="geocoding",
        )

    lat, lon = coords
    try:
        resp = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "current_weather": True,
                "hourly": "relativehumidity_2m,apparent_temperature",
                "forecast_days": 1,
                "timezone": "auto",
            },
            timeout=6,
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.Timeout:
        return FactResult(success=False, text=_FALLBACK_TEXT, source="open-meteo")
    except Exception as exc:
        return FactResult(success=False, text=_FALLBACK_TEXT,
                          debug={"error": str(exc)}, source="open-meteo")

    cw = data.get("current_weather", {})
    temp_c = cw.get("temperature")
    wind_kph = cw.get("windspeed")
    wmo = int(cw.get("weathercode", -1))
    condition = _WMO_CODES.get(wmo, "Unknown conditions")

    # Grab apparent temp + humidity from the first hourly slot
    hourly = data.get("hourly", {})
    feels_like = None
    humidity = None
    if hourly.get("apparent_temperature"):
        feels_like = hourly["apparent_temperature"][0]
    if hourly.get("relativehumidity_2m"):
        humidity = hourly["relativehumidity_2m"][0]

    city_display = city.title()
    parts = [
        f"Current weather in **{city_display}**: {condition}.",
        f"Temperature: {temp_c}°C",
    ]
    if feels_like is not None:
        parts.append(f"Feels like: {feels_like}°C")
    if humidity is not None:
        parts.append(f"Humidity: {humidity}%")
    if wind_kph is not None:
        parts.append(f"Wind: {wind_kph} km/h")
    parts.append("*(Live data from Open-Meteo)*")

    return FactResult(
        success=True,
        text="  |  ".join(parts),
        source="open-meteo.com",
        debug={"lat": lat, "lon": lon, "wmo": wmo},
    )


# ---------------------------------------------------------------------------
# 2. CURRENT LEADER  (Google Search + extraction)
# ---------------------------------------------------------------------------

# Ordered list of extraction patterns.  Each pattern should have one capture
# group that contains the leader's name (possibly with title).
_LEADER_PATTERNS: list[re.Pattern] = [
    # "The President of X is John Smith"
    re.compile(
        r"(?:president|prime minister|chancellor|premier|king|queen|sultan|"
        r"emperor|emir|ceo|director general|secretary.general)\s+(?:of\s+)?[A-Z][A-Za-z\s]+\s+is\s+([A-Z][A-Za-z\s\-\.]{3,40})",
        re.IGNORECASE,
    ),
    # "John Smith is the current President of X"
    re.compile(
        r"([A-Z][A-Za-z\s\-\.]{3,40})\s+is\s+(?:the\s+)?(?:current\s+)?(?:president|prime minister|"
        r"chancellor|premier|king|queen|sultan|emperor|emir)\s+of",
        re.IGNORECASE,
    ),
    # "John Smith became/was elected/was appointed president of X"
    re.compile(
        r"([A-Z][A-Za-z\s\-\.]{3,40})\s+(?:became|was elected|was appointed|took office as|"
        r"serves as|assumed office as)\s+(?:the\s+)?(?:president|prime minister|chancellor|premier)",
        re.IGNORECASE,
    ),
    # "X is led by John Smith"
    re.compile(
        r"(?:is led by|is governed by|is headed by)\s+([A-Z][A-Za-z\s\-\.]{3,40})",
        re.IGNORECASE,
    ),
]

# Noise phrases that can contaminate a name capture
_NOISE_PHRASES = re.compile(
    r"\b(the|a|an|former|current|new|re-elected|incumbent|outgoing|"
    r"recently|elected|appointed|since)\b",
    re.IGNORECASE,
)


def _clean_name(raw: str) -> str:
    cleaned = _NOISE_PHRASES.sub("", raw).strip(" ,.")
    # Collapse multiple spaces
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    return cleaned


def _extract_leader_from_snippets(snippets: list[str], country: str) -> str | None:
    """Try each extraction pattern across all snippets, return first clean match."""
    for snippet in snippets:
        for pattern in _LEADER_PATTERNS:
            m = pattern.search(snippet)
            if m:
                name = _clean_name(m.group(1))
                # Sanity: name should be 2–5 words and not the country itself
                words = name.split()
                if 1 < len(words) <= 6 and country.lower() not in name.lower():
                    return name
    return None


def get_current_leader(country: str, role: str = "") -> FactResult:
    """Search for and extract the current leader of *country*."""
    resp: SearchResponse = search_current_leader(country, role or "president OR prime minister")

    debug_info = {
        "query": resp.query,
        "results": len(resp.results),
        "elapsed_ms": resp.elapsed_ms,
    }

    if not resp.ok:
        return FactResult(
            success=False,
            text=_FALLBACK_TEXT,
            source="google-search",
            debug={**debug_info, "error": resp.error},
        )

    snippets = [r.snippet for r in resp.results] + [r.title for r in resp.results]
    leader = _extract_leader_from_snippets(snippets, country)

    if not leader:
        # Fall back: just surface the best snippet for Groq to rephrase
        best = resp.best_snippet()
        if best:
            return FactResult(
                success=True,
                text=f"Based on recent sources: {best}",
                source=resp.results[0].source if resp.results else "google-search",
                debug={**debug_info, "extraction": "failed, used best snippet"},
            )
        return FactResult(
            success=False,
            text=_FALLBACK_TEXT,
            source="google-search",
            debug={**debug_info, "extraction": "failed"},
        )

    role_label = role or "leader"
    return FactResult(
        success=True,
        text=f"The current {role_label} of {country.title()} is **{leader}**.",
        source=resp.results[0].source if resp.results else "google-search",
        debug={**debug_info, "extracted_name": leader},
    )


# ---------------------------------------------------------------------------
# 3. NEWS / SPORTS / ELECTIONS
# ---------------------------------------------------------------------------

def get_news(topic: str, *, recency: str = "m1") -> FactResult:
    resp = search_news(topic, recency=recency)
    return _summarise_search("news", topic, resp)


def get_sports(topic: str) -> FactResult:
    resp = search_sports(topic)
    return _summarise_search("sports", topic, resp)


def get_election(country_or_topic: str) -> FactResult:
    resp = search_election(country_or_topic)
    return _summarise_search("election", country_or_topic, resp)


def _summarise_search(kind: str, topic: str, resp: SearchResponse) -> FactResult:
    debug_info = {
        "kind": kind,
        "query": resp.query,
        "results": len(resp.results),
        "elapsed_ms": resp.elapsed_ms,
    }

    if not resp.ok:
        return FactResult(
            success=False,
            text=_FALLBACK_TEXT,
            source="google-search",
            debug={**debug_info, "error": resp.error},
        )

    summary = resp.combined_snippets(n=3)
    sources = ", ".join({r.source for r in resp.results[:3]})

    return FactResult(
        success=True,
        text=f"Here's what I found about **{topic}** ({kind}):\n\n{summary}\n\n*(Sources: {sources})*",
        source="google-search",
        debug=debug_info,
    )