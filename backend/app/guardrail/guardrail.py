"""
The anti-fabrication guardrail. This is what backs the "why not ChatGPT"
answer in the pitch: any number the AI writes gets checked against the
engine's own output before it reaches the screen. Anything that doesn't
match gets deleted, not silently kept.
"""
import re
from typing import List, Tuple

NUMBER_PATTERN = re.compile(r"-?\d[\d,]*\.?\d*%?")


def _flatten_numbers(obj, acc: set) -> None:
    """Recursively collect every numeric value inside a JSON-like structure
    into a set of string forms, so we can match however the LLM formats it."""
    if isinstance(obj, bool):
        return
    if isinstance(obj, (int, float)):
        acc.add(str(obj))
        acc.add(f"{obj:.0f}")
        acc.add(f"{obj:.1f}")
        acc.add(f"{obj:.2f}")
        acc.add(str(round(obj)))
    elif isinstance(obj, dict):
        for v in obj.values():
            _flatten_numbers(v, acc)
    elif isinstance(obj, (list, tuple)):
        for v in obj:
            _flatten_numbers(v, acc)


def allowed_numbers(context: dict) -> set:
    acc: set = set()
    _flatten_numbers(context, acc)
    return acc


def enforce(text: str, context: dict) -> Tuple[str, List[str]]:
    """
    Scan `text` for numeric tokens. Any number not present (in some rounded
    form) in the engine's own output is stripped and replaced with
    "[unverified]". Returns the cleaned text and a list of what was removed.
    """
    allowed = allowed_numbers(context)
    removed: List[str] = []

    def _check(match: "re.Match") -> str:
        token = match.group(0)
        bare = token.rstrip("%").replace(",", "")
        try:
            as_float = float(bare)
        except ValueError:
            return token

        candidates = {
            bare,
            str(as_float),
            f"{as_float:.0f}",
            f"{as_float:.1f}",
            f"{as_float:.2f}",
            str(round(as_float)),
        }
        if candidates & allowed:
            return token

        removed.append(token)
        return "[unverified]"

    cleaned = NUMBER_PATTERN.sub(_check, text)
    return cleaned, removed
