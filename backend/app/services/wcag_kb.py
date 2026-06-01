"""
wcag_kb.py
----------
WCAG knowledge base lookup.

get_wcag_rules(message) → list of matched rule dicts

Design goals:
  - More keyword coverage than the original 6-entry map
  - Whole-word matching (avoids false positives)
  - Returns at most 3 rules per query (prevents prompt bloat)
  - Each returned dict has: id, title, summary (ready for Groq prompt injection)
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Load wcag.json
# ---------------------------------------------------------------------------

_WCAG_PATH = Path(__file__).resolve().parents[2] / "wcag.json"


def _load_rules(path: Path) -> dict[str, dict[str, Any]]:
    with path.open("r", encoding="utf-8") as fh:
        raw: dict = json.load(fh)
    normalised: dict[str, dict[str, Any]] = {}
    for rule_id, data in raw.items():
        if isinstance(data, dict):
            normalised[str(rule_id)] = {"id": str(rule_id), **data}
        else:
            normalised[str(rule_id)] = {
                "id": str(rule_id),
                "title": "",
                "summary": str(data),
            }
    return normalised


try:
    _WCAG_RULES: dict[str, dict[str, Any]] = _load_rules(_WCAG_PATH)
except FileNotFoundError:
    _WCAG_RULES = {}


# ---------------------------------------------------------------------------
# Keyword → rule-id map
# Tuples of (keyword_terms, rule_id).
# Ordered from most-specific to least-specific.
# ---------------------------------------------------------------------------

_KEYWORD_MAP: list[tuple[tuple[str, ...], str]] = [
    # 1.1.x  Non-text content
    (("alt text", "alt attribute", "image alt", "missing alt", "decorative image",
      "text alternative", "non-text content"), "1.1.1"),

    # 1.2.x  Media
    (("caption", "captions", "subtitle", "subtitles", "closed caption"), "1.2.2"),
    (("live caption", "live captions", "live broadcast", "live stream"), "1.2.4"),
    (("audio description", "video description", "prerecorded video"), "1.2.5"),
    (("transcript", "audio only", "video only", "podcast transcript"), "1.2.1"),

    # 1.3.x  Adaptable
    (("semantic html", "heading", "headings", "landmark", "label", "form label",
      "programmatic", "info and relationships", "structure"), "1.3.1"),
    (("reading order", "meaningful sequence", "dom order", "css order"), "1.3.2"),
    (("sensory", "shape", "size", "color only instruction"), "1.3.3"),
    (("orientation", "portrait", "landscape", "screen rotation"), "1.3.4"),
    (("autocomplete", "input purpose", "autofill"), "1.3.5"),

    # 1.4.x  Distinguishable
    (("color", "colour", "color alone", "colorblind", "colour blindness",
      "greyscale", "grayscale"), "1.4.1"),
    (("autoplay", "auto-play", "audio control", "mute", "background sound"), "1.4.2"),
    (("contrast", "contrast ratio", "contrast checker", "luminance",
      "low contrast", "text contrast", "color contrast"), "1.4.3"),
    (("resize text", "text zoom", "zoom", "200 percent"), "1.4.4"),
    (("images of text", "text in image", "png text"), "1.4.5"),
    (("reflow", "horizontal scroll", "320px", "mobile zoom", "single column"), "1.4.10"),
    (("non-text contrast", "ui component contrast", "focus indicator contrast",
      "border contrast"), "1.4.11"),
    (("text spacing", "letter spacing", "word spacing", "line height",
      "paragraph spacing"), "1.4.12"),
    (("hover", "tooltip", "focus popup", "persistent tooltip",
      "content on hover"), "1.4.13"),

    # 2.1.x  Keyboard accessible
    (("keyboard", "keyboard accessible", "keyboard only", "tab order",
      "tab key", "tabable", "cannot tab"), "2.1.1"),
    (("keyboard trap", "focus trap", "trapped focus", "modal focus",
      "escape key"), "2.1.2"),

    # 2.2.x  Enough time
    (("timeout", "time limit", "session expiry", "auto logout"), "2.2.1"),
    (("pause", "stop", "hide", "animation", "carousel", "auto scroll",
      "blinking", "flashing banner"), "2.2.2"),

    # 2.3.x  Seizures
    (("flash", "flicker", "strobe", "photosensitive", "three flashes"), "2.3.1"),

    # 2.4.x  Navigable
    (("skip link", "skip navigation", "bypass block", "main content link"), "2.4.1"),
    (("page title", "title element", "document title"), "2.4.2"),
    (("focus order", "tabindex", "tab index", "positive tabindex",
      "logical order", "focus sequence"), "2.4.3"),
    (("link text", "link purpose", "descriptive link", "click here",
      "read more", "learn more"), "2.4.4"),
    (("focus visible", "focus indicator", "focus ring", "outline none",
      "outline: none", "visible focus", "focus outline"), "2.4.7"),

    # 2.5.x  Input modalities
    (("touch target", "target size", "click area", "tap area"), "2.5.5"),
    (("drag", "drag and drop", "draggable"), "2.5.7"),

    # 3.1.x  Readable
    (("lang attribute", "language attribute", "html lang", "page language"), "3.1.1"),

    # 3.2.x  Predictable
    (("on focus", "focus triggers", "context change on focus"), "3.2.1"),
    (("consistent navigation", "nav order", "navigation order"), "3.2.3"),
    (("consistent identification", "icon consistency"), "3.2.4"),

    # 3.3.x  Input assistance
    (("error", "error message", "form error", "input error",
      "validation error", "error identification"), "3.3.1"),
    (("error suggestion", "correction hint", "fix the error"), "3.3.3"),
    (("error prevention", "confirm submit", "review before submit"), "3.3.4"),

    # 4.1.x  Compatible / Robust
    (("parsing", "valid html", "duplicate id", "malformed html"), "4.1.1"),
    (("name role value", "aria role", "aria state", "aria property",
      "custom widget", "accessible name", "aria-label", "aria-labelledby",
      "aria-describedby"), "4.1.2"),
    (("status message", "aria live", "live region", "aria-live",
      "toast notification", "alert"), "4.1.3"),
]

_MAX_RULES = 3   # cap to avoid bloating the Groq prompt


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_wcag_rules(message: str) -> list[dict[str, str]]:
    """
    Return up to _MAX_RULES matching WCAG rule dicts for *message*.

    Each dict has: id, title, summary.
    Rules are deduplicated and ordered by first-match position in _KEYWORD_MAP.
    """
    lowered = message.lower()
    matched_ids: list[str] = []

    for keywords, rule_id in _KEYWORD_MAP:
        if rule_id in matched_ids:
            continue
        if _any_keyword_matches(lowered, keywords):
            matched_ids.append(rule_id)
        if len(matched_ids) >= _MAX_RULES:
            break

    results: list[dict[str, str]] = []
    for rid in matched_ids:
        rule = _WCAG_RULES.get(rid)
        if rule:
            results.append(_rule_ref(rule))

    return results


def search_wcag_rules(message: str) -> list[dict[str, str]]:
    """Alias kept for backward compatibility."""
    return get_wcag_rules(message)


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _any_keyword_matches(text: str, keywords: tuple[str, ...]) -> bool:
    """
    Return True if any keyword appears in text as a whole-phrase match
    (word-boundary aware, handles multi-word phrases).
    """
    for kw in keywords:
        # Escape special regex chars in keyword, then wrap with word boundaries
        # For multi-word phrases, boundary applies at start and end of phrase
        escaped = re.escape(kw)
        pattern = rf"(?<!\w){escaped}(?!\w)" if " " not in kw else rf"\b{escaped}\b"
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False


def _rule_ref(rule: dict[str, Any]) -> dict[str, str]:
    return {
        "id": str(rule.get("id", "")).strip(),
        "title": str(rule.get("title", "")).strip(),
        "summary": str(rule.get("summary", "")).strip(),
    }