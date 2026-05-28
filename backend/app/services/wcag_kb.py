import json
import re
from pathlib import Path
from typing import Any


WCAG_PATH = Path(__file__).resolve().parents[2] / "wcag.json"

KEYWORD_RULE_MAP: list[tuple[tuple[str, ...], str]] = [
    (("image", "alt", "photo"), "1.1.1"),
    (("contrast", "color", "brightness"), "1.4.3"),
    (("keyboard", "tab", "focus"), "2.1.1"),
    (("caption", "captions", "live captions", "live"), "1.2.4"),
    (("form", "input", "label"), "1.3.1"),
    (("name", "role", "value"), "4.1.2"),
]


def load_wcag_rules(path: Path = WCAG_PATH) -> dict[str, dict[str, Any]]:
    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, dict):
        raise ValueError("wcag.json must contain an object of WCAG rule ids to rule data.")

    normalized: dict[str, dict[str, Any]] = {}
    for rule_id, rule_data in data.items():
        if isinstance(rule_data, dict):
            normalized[str(rule_id)] = {"id": str(rule_id), **rule_data}
        else:
            normalized[str(rule_id)] = {
                "id": str(rule_id),
                "title": "",
                "summary": str(rule_data),
            }

    return normalized


WCAG_RULES = load_wcag_rules()


def _rule_ref(rule: dict[str, Any]) -> dict[str, str]:
    return {
        "id": str(rule.get("id", "")).strip(),
        "title": str(rule.get("title", "")).strip(),
        "summary": str(rule.get("summary", "")).strip(),
    }


def _has_keyword(message: str, keywords: tuple[str, ...]) -> bool:
    lowered = message.lower()
    return any(re.search(rf"\b{re.escape(keyword)}\b", lowered) for keyword in keywords)


def get_wcag_rules(message: str) -> list[dict[str, str]]:
    matched_rule_ids: list[str] = []

    for keywords, rule_id in KEYWORD_RULE_MAP:
        if _has_keyword(message, keywords) and rule_id not in matched_rule_ids:
            matched_rule_ids.append(rule_id)

    matched_rules: list[dict[str, str]] = []
    for rule_id in matched_rule_ids:
        rule = WCAG_RULES.get(rule_id)
        if rule:
            matched_rules.append(_rule_ref(rule))

    return matched_rules


search_wcag_rules = get_wcag_rules
