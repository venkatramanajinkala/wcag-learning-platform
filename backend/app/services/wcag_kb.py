import json
import re
from pathlib import Path
from typing import Any


WCAG_PATH = Path(__file__).resolve().parents[2] / "wcag.json"

KEYWORD_RULE_MAP: list[tuple[tuple[str, ...], str]] = [
    (("image", "alt", "photo"), "1.1.1"),
    (("contrast", "color", "brightness"), "1.4.3"),
    (("keyboard", "tab", "focus"), "2.1.1"),
    (("form", "input", "label"), "1.3.1"),
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


def _format_rule(rule: dict[str, Any]) -> str:
    parts = [
        f"{rule.get('id')}: {rule.get('title', '')}".strip(),
        f"Summary: {rule.get('summary', '')}",
        f"Description: {rule.get('description', '')}",
        f"Why it matters: {rule.get('whyItMatters', '')}",
    ]

    best_practices = rule.get("bestPractices") or []
    if isinstance(best_practices, list) and best_practices:
        parts.append(f"Best practices: {'; '.join(str(item) for item in best_practices[:3])}")

    failure_scenarios = rule.get("failureScenarios") or []
    if isinstance(failure_scenarios, list) and failure_scenarios:
        parts.append(f"Failure scenarios: {'; '.join(str(item) for item in failure_scenarios[:3])}")

    test_methodology = rule.get("testMethodology") or []
    if isinstance(test_methodology, list) and test_methodology:
        parts.append(f"How to test: {'; '.join(str(item) for item in test_methodology[:3])}")

    examples = rule.get("examples") or []
    if isinstance(examples, list) and examples:
        example_titles = [
            str(example.get("title"))
            for example in examples
            if isinstance(example, dict) and example.get("title")
        ]
        if example_titles:
            parts.append(f"Related app examples: {'; '.join(example_titles[:3])}")

    return "\n".join(part for part in parts if part.strip())


def _has_keyword(message: str, keywords: tuple[str, ...]) -> bool:
    lowered = message.lower()
    return any(re.search(rf"\b{re.escape(keyword)}\b", lowered) for keyword in keywords)


def get_wcag_rules(message: str) -> list[str]:
    matched_rule_ids: list[str] = []

    for keywords, rule_id in KEYWORD_RULE_MAP:
        if _has_keyword(message, keywords) and rule_id not in matched_rule_ids:
            matched_rule_ids.append(rule_id)

    matched_rules: list[str] = []
    for rule_id in matched_rule_ids:
        rule = WCAG_RULES.get(rule_id)
        if rule:
            matched_rules.append(_format_rule(rule))

    return matched_rules


search_wcag_rules = get_wcag_rules
