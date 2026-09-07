"""
The only network-touching module in the backend. Calls an LLM to turn
engine output into plain-English prose, then runs it through the guardrail
before it ever reaches the frontend. If no LLM is configured — no API key,
or the call fails or times out — falls back to a template-based explanation
built directly from the numbers, so flaky venue wifi never breaks the demo.
"""
import os
from typing import Optional

from .guardrail.guardrail import enforce


def _template_fallback(context: dict) -> str:
    """A deterministic, guardrail-safe explanation with zero LLM involvement."""
    label = context.get("label", "This scenario")
    cycle = context.get("cycle_time_days")
    bottleneck = context.get("bottleneck_stage")
    parts = [f"{label} delivers in {cycle} days."]
    if bottleneck:
        parts.append(f"The bottleneck is {bottleneck} — that stage is driving the wait.")
    return " ".join(parts)


def explain(context: dict, question: Optional[str] = None) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("OPENAI_API_KEY")

    raw_text = None
    source = "fallback"
    if api_key:
        try:
            raw_text = _call_llm(context, question, api_key)
            source = "llm"
        except Exception:
            raw_text = None
            source = "fallback"

    if raw_text is None:
        raw_text = _template_fallback(context)
        source = "fallback"

    cleaned, removed = enforce(raw_text, context)

    return {
        "explanation": cleaned,
        "numbers_removed": removed,
        "numbers_verified": len(removed) == 0,
        "source": source,
    }


def _call_llm(context: dict, question: Optional[str], api_key: str) -> str:
    """Thin wrapper — the guardrail downstream is what makes this safe,
    not anything clever happening here."""
    import httpx

    prompt = (
        "You are explaining a workflow simulation result to a non-technical "
        "manager in one or two plain sentences. Only use numbers that appear "
        f"in this JSON, do not invent any others: {context}\n"
    )
    if question:
        prompt += f"Specifically answer: {question}\n"

    if os.getenv("ANTHROPIC_API_KEY"):
        resp = httpx.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-5",
                "max_tokens": 200,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=8.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["content"][0]["text"]

    raise RuntimeError("No supported LLM provider configured")
