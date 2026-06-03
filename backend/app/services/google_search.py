"""
google_search.py
----------------
Google Custom Search JSON API wrapper with:
  - snippet extraction + ranking
  - multi-query fallback
  - structured debug metadata
  - safe empty-result handling

Requires env vars:
  GOOGLE_SEARCH_API_KEY   – Custom Search API key
  GOOGLE_SEARCH_CX        – Programmable Search Engine ID

Both are read from Settings (pydantic-settings / .env).
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from threading import Lock
from typing import Any

from cachetools import TTLCache
import requests

from app.core.config import get_settings

_search_cache: TTLCache = TTLCache(maxsize=256, ttl=600)  # 10 min default
_cache_lock = Lock()


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class SearchResult:
    title: str
    snippet: str
    link: str
    source: str          # domain only, e.g. "bbc.co.uk"
    relevance: float = 0.0   # 0.0–1.0, computed locally


@dataclass
class SearchResponse:
    query: str
    results: list[SearchResult]
    total_found: int
    elapsed_ms: float
    error: str | None = None
    debug: dict[str, Any] = field(default_factory=dict)

    # Convenience ─────────────────────────────────────────────────────────
    @property
    def ok(self) -> bool:
        return self.error is None and len(self.results) > 0

    def best_snippet(self, max_chars: int = 600) -> str:
        """Return the single highest-relevance snippet, truncated."""
        if not self.results:
            return ""
        top = sorted(self.results, key=lambda r: r.relevance, reverse=True)[0]
        return top.snippet[:max_chars]

    def combined_snippets(self, n: int = 3, max_chars: int = 1200) -> str:
        """Return top-n snippets joined, deduplicated, truncated."""
        seen: set[str] = set()
        parts: list[str] = []
        for r in sorted(self.results, key=lambda r: r.relevance, reverse=True)[:n]:
            norm = r.snippet.strip()
            if norm and norm not in seen:
                seen.add(norm)
                parts.append(f"[{r.source}] {norm}")
        return "\n".join(parts)[:max_chars]


# ---------------------------------------------------------------------------
# Relevance scoring helpers
# ---------------------------------------------------------------------------

# Authoritative source bonuses
_AUTHORITY_DOMAINS: dict[str, float] = {
    "wikipedia.org": 0.10,
    "britannica.com": 0.10,
    "bbc.co.uk": 0.08,
    "bbc.com": 0.08,
    "reuters.com": 0.10,
    "apnews.com": 0.10,
    "theguardian.com": 0.07,
    "nytimes.com": 0.07,
    "washingtonpost.com": 0.07,
    "who.int": 0.10,
    "un.org": 0.10,
    "gov": 0.06,        # generic TLD suffix
}

# Recency signals in snippet text
_RECENCY_TOKENS = re.compile(
    r"\b(202[3-9]|2030|january|february|march|april|may|june|july|august|"
    r"september|october|november|december|today|yesterday|this week|"
    r"this month|recently|latest|current|now)\b",
    re.IGNORECASE,
)


def _score_result(result: SearchResult, query_tokens: set[str]) -> float:
    """Heuristic 0–1 relevance score."""
    score = 0.30  # baseline

    # Token overlap between query and snippet+title
    text = f"{result.title} {result.snippet}".lower()
    overlap = sum(1 for t in query_tokens if t in text)
    score += min(overlap / max(len(query_tokens), 1), 0.35) * 0.35

    # Recency signals
    if _RECENCY_TOKENS.search(result.snippet):
        score += 0.15

    # Authority bonus
    for domain, bonus in _AUTHORITY_DOMAINS.items():
        if domain in result.source:
            score += bonus
            break

    # Penalise very short snippets (< 40 chars) – probably unhelpful
    if len(result.snippet) < 40:
        score -= 0.10

    return round(min(max(score, 0.0), 1.0), 3)


def _extract_domain(url: str) -> str:
    m = re.search(r"https?://(?:www\.)?([^/]+)", url)
    return m.group(1) if m else url[:40]


# ---------------------------------------------------------------------------
# Core search function
# ---------------------------------------------------------------------------

def google_search(
    query: str,
    *,
    num: int = 5,
    fallback_queries: list[str] | None = None,
    date_restrict: str | None = None,  # e.g. "m1" = last month
    debug: bool = False,
) -> SearchResponse:
    """
    Call Google Custom Search and return a SearchResponse.

    Parameters
    ----------
    query          : Primary search string.
    num            : Results to request (1–10).
    fallback_queries: Tried in order if primary returns 0 results.
    date_restrict  : Google dateRestrict param (d1, w1, m1, m3, y1 …).
    debug          : Attach raw API response to SearchResponse.debug.
    """
    settings = get_settings()
    api_key: str = getattr(settings, "google_search_api_key", "")
    cx: str = getattr(settings, "google_search_cx", "")

    if not api_key or not cx:
        return SearchResponse(
            query=query,
            results=[],
            total_found=0,
            elapsed_ms=0,
            error="Google Search is not configured (GOOGLE_SEARCH_API_KEY / GOOGLE_SEARCH_CX missing).",
        )

    cache_key = f"{query}|{date_restrict or ''}|{num}"
    with _cache_lock:
        cached = _search_cache.get(cache_key)
        if cached is not None:
            return cached

    queries_to_try = [query] + (fallback_queries or [])
    last_error: str | None = None

    for attempt_query in queries_to_try:
        resp = _call_api(
            attempt_query,
            api_key=api_key,
            cx=cx,
            num=min(max(num, 1), 10),
            date_restrict=date_restrict,
            debug=debug,
        )
        if resp.ok:
            with _cache_lock:
                _search_cache[cache_key] = resp
            return resp
        last_error = resp.error or "no results"

    # All queries exhausted – return empty with last error
    return SearchResponse(
        query=query,
        results=[],
        total_found=0,
        elapsed_ms=0,
        error=last_error or "All fallback queries returned no results.",
        debug={"tried_queries": queries_to_try} if debug else {},
    )


def _call_api(
    query: str,
    *,
    api_key: str,
    cx: str,
    num: int,
    date_restrict: str | None,
    debug: bool,
) -> SearchResponse:
    t0 = time.perf_counter()

    params: dict[str, Any] = {
        "key": api_key,
        "cx": cx,
        "q": query,
        "num": num,
        "safe": "active",
    }
    if date_restrict:
        params["dateRestrict"] = date_restrict

    try:
        raw = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params=params,
            timeout=8,
        )
        elapsed = (time.perf_counter() - t0) * 1000
        raw.raise_for_status()
        data: dict[str, Any] = raw.json()
    except requests.Timeout:
        return SearchResponse(query=query, results=[], total_found=0, elapsed_ms=0,
                              error="Google Search timed out.")
    except requests.HTTPError as exc:
        return SearchResponse(query=query, results=[], total_found=0, elapsed_ms=0,
                              error=f"Google Search HTTP {exc.response.status_code}: {exc.response.text[:120]}")
    except Exception as exc:
        return SearchResponse(query=query, results=[], total_found=0, elapsed_ms=0,
                              error=f"Google Search error: {exc}")

    items: list[dict] = data.get("items", [])
    if not items:
        return SearchResponse(query=query, results=[], total_found=0, elapsed_ms=elapsed,
                              error="No results returned.",
                              debug={"raw": data} if debug else {})

    total = int(data.get("searchInformation", {}).get("totalResults", len(items)))
    query_tokens = {t.lower() for t in re.split(r"\W+", query) if len(t) > 2}

    results: list[SearchResult] = []
    for item in items:
        title = item.get("title", "")
        snippet = item.get("snippet", "").replace("\n", " ").strip()
        link = item.get("link", "")
        source = _extract_domain(link)

        # Prefer the longer metatag description if available
        meta_desc = (
            item.get("pagemap", {})
            .get("metatags", [{}])[0]
            .get("og:description", "")
        )
        if meta_desc and len(meta_desc) > len(snippet):
            snippet = meta_desc[:500]

        sr = SearchResult(title=title, snippet=snippet, link=link, source=source)
        sr.relevance = _score_result(sr, query_tokens)
        results.append(sr)

    # Sort by descending relevance
    results.sort(key=lambda r: r.relevance, reverse=True)

    return SearchResponse(
        query=query,
        results=results,
        total_found=total,
        elapsed_ms=round(elapsed, 1),
        debug={"raw": data, "query_tokens": list(query_tokens)} if debug else {},
    )


# ---------------------------------------------------------------------------
# Convenience wrappers used by other services
# ---------------------------------------------------------------------------

def search_current_leader(country: str, role: str = "president OR prime minister") -> SearchResponse:
    """Optimised search for 'who leads X right now'."""
    primary = f"current {role} of {country} {_current_year()}"
    fallbacks = [
        f"{country} head of government {_current_year()}",
        f"who is the leader of {country}",
    ]
    return google_search(primary, num=5, fallback_queries=fallbacks, date_restrict="y1")


def search_news(topic: str, *, recency: str = "m1") -> SearchResponse:
    """Recent news about a topic."""
    primary = f"{topic} latest news"
    fallbacks = [f"{topic} news {_current_year()}"]
    return google_search(primary, num=5, fallback_queries=fallbacks, date_restrict=recency)


def search_sports(topic: str) -> SearchResponse:
    """Sports scores / standings."""
    primary = f"{topic} score result {_current_year()}"
    fallbacks = [f"{topic} latest update"]
    return google_search(primary, num=5, fallback_queries=fallbacks, date_restrict="w1")


def search_election(country_or_topic: str) -> SearchResponse:
    primary = f"{country_or_topic} election results {_current_year()}"
    fallbacks = [
        f"{country_or_topic} election winner",
        f"{country_or_topic} election latest",
    ]
    return google_search(primary, num=5, fallback_queries=fallbacks, date_restrict="y1")


def search_wcag(topic: str) -> SearchResponse:
    """
    Search for WCAG/accessibility information scoped to authoritative domains.
    Uses site-restricted query with fallback to broad search.
    """
    scoped_query = (
        f"{topic} site:w3.org OR site:webaim.org OR site:developer.mozilla.org "
        f"OR site:www.w3.org/WAI"
    )
    broad_query = f"WCAG accessibility {topic} {_current_year()}"
    fallback_query = f"{topic} WCAG criterion"

    return google_search(
        scoped_query,
        num=5,
        fallback_queries=[broad_query, fallback_query],
        date_restrict="y2",
    )


def _current_year() -> int:
    import datetime
    return datetime.date.today().year
