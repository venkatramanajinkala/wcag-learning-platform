import json
import re
from pathlib import Path
from typing import Any


WCAG_PATH = Path(__file__).resolve().parents[2] / "wcag.json"


def load_wcag_rules(path: Path = WCAG_PATH) -> dict[str, dict[str, Any]]:
    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)
    if not isinstance(data, dict):
        raise ValueError("wcag.json must contain an object of WCAG rule ids to rule text.")

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


def _keywords(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9.]+", text.lower())
    return {word for word in words if len(word) > 2}


def _flatten_text(value: Any) -> str:
    if isinstance(value, dict):
        return " ".join(_flatten_text(item) for item in value.values())
    if isinstance(value, list):
        return " ".join(_flatten_text(item) for item in value)
    return str(value)


def _list_text(value: Any, limit: int = 3) -> str:
    if not isinstance(value, list) or not value:
        return ""
    return "; ".join(str(item) for item in value[:limit])


def _format_rule(rule: dict[str, Any]) -> str:
    example_titles = [
        str(example.get("title"))
        for example in rule.get("examples", [])
        if isinstance(example, dict) and example.get("title")
    ]
    parts = [
        f"{rule.get('id')}: {rule.get('title', '')}".strip(),
        f"Level: {rule.get('level', 'Unknown')} | Principle: {rule.get('principle', 'Unknown')} | WCAG: {rule.get('version', 'Unknown')}",
        f"Summary: {rule.get('summary', '')}",
        f"Description: {rule.get('description', '')}",
        f"Why it matters: {rule.get('whyItMatters', '')}",
    ]

    best_practices = _list_text(rule.get("bestPractices"))
    if best_practices:
        parts.append(f"Best practices: {best_practices}")

    failure_scenarios = _list_text(rule.get("failureScenarios"))
    if failure_scenarios:
        parts.append(f"Failure scenarios: {failure_scenarios}")

    test_methodology = _list_text(rule.get("testMethodology"))
    if test_methodology:
        parts.append(f"How to test: {test_methodology}")

    if example_titles:
        parts.append(f"Related app examples: {'; '.join(example_titles[:3])}")

    return "\n".join(part for part in parts if part.strip())


def search_wcag_rules(message: str, limit: int = 5) -> list[str]:
    query_terms = _keywords(message)
    if not query_terms:
        return []

    scored_rules: list[tuple[int, str, dict[str, Any]]] = []
    lowered_message = message.lower()

    for rule_id, rule_data in WCAG_RULES.items():
        searchable = f"{rule_id} {_flatten_text(rule_data)}".lower()
        rule_terms = _keywords(searchable)
        score = len(query_terms.intersection(rule_terms))

        if rule_id in lowered_message:
            score += 8
        if str(rule_data.get("title", "")).lower() in lowered_message:
            score += 5
        if any(term in searchable for term in query_terms):
            score += 1

        if score > 0:
            scored_rules.append((score, rule_id, rule_data))

    scored_rules.sort(key=lambda item: (-item[0], item[1]))
    return [_format_rule(rule_data) for _, _, rule_data in scored_rules[:limit]]
