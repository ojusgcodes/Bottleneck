
"""Business expansion / investment decision layer.

Deterministic by design: natural-language parsing only extracts facts. All
financial outputs are calculated here from explicit inputs and assumptions.
"""

from __future__ import annotations

import math
import re
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DecisionProblemRequest(BaseModel):
    problem: str = Field(min_length=3)


class BusinessDecisionInput(BaseModel):
    capital_available: Optional[float] = Field(default=None, ge=0)
    investment_required: Optional[float] = Field(default=None, ge=0)
    monthly_revenue: Optional[float] = Field(default=None, ge=0)
    monthly_operating_cost: Optional[float] = Field(default=None, ge=0)
    gross_margin_pct: Optional[float] = Field(default=None, ge=0, le=100)
    monthly_growth_pct: Optional[float] = Field(default=None, ge=-100, le=200)
    monthly_fixed_cost: Optional[float] = Field(default=None, ge=0)
    working_capital_months: Optional[float] = Field(default=None, ge=0)
    horizon_months: int = Field(default=36, ge=1, le=120)
    risk_tolerance: Optional[str] = None
    objective: Optional[str] = None
    location: Optional[str] = None
    current_monthly_profit: Optional[float] = None


class DecisionSimulateRequest(BaseModel):
    inputs: BusinessDecisionInput
    assumptions: Dict[str, float] = Field(default_factory=dict)


class DecisionWhatIfRequest(BaseModel):
    inputs: BusinessDecisionInput
    changes: Dict[str, float] = Field(default_factory=dict)
    assumptions: Dict[str, float] = Field(default_factory=dict)


class DecisionStressRequest(BaseModel):
    inputs: BusinessDecisionInput
    assumptions: Dict[str, float] = Field(default_factory=dict)
    shocks: Dict[str, float] = Field(default_factory=dict)


def _money(text: str) -> Optional[float]:
    s = text.lower().replace(",", "").strip()
    m = re.search(r"(₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|million|m|k)?", s)
    if not m:
        return None
    n = float(m.group(2))
    unit = (m.group(3) or "").lower()
    mult = {
        "crore": 10_000_000, "cr": 10_000_000,
        "lakh": 100_000, "lac": 100_000,
        "million": 1_000_000, "m": 1_000_000, "k": 1_000,
    }.get(unit, 1)
    return n * mult


def analyze_problem(problem: str) -> Dict[str, Any]:
    p = problem.strip()
    low = p.lower()
    known: Dict[str, Any] = {}
    entities: List[str] = []
    constraints: List[str] = []
    objectives: List[str] = []

    if any(x in low for x in ("expand", "expansion", "new branch", "new store", "new plant", "new hub")):
        decision_type = "business_expansion"
    elif any(x in low for x in ("invest", "investment", "acquire", "acquisition", "buy")):
        decision_type = "investment"
    else:
        decision_type = "business_decision"

    capital_match = re.search(
        r"(?:have|available|capital|budget|cash|funding)[^₹\d]{0,30}(₹|rs\.?|inr)?\s*([\d,.]+)\s*(crore|cr|lakh|lac|million|m|k)?",
        low,
    )
    if capital_match:
        known["capital_available"] = _money(capital_match.group(0))

    if known.get("capital_available") is None:
        rupee = re.search(r"(₹|rs\.?|inr)\s*([\d,.]+)\s*(crore|cr|lakh|lac|million|m|k)?", low)
        if rupee:
            known["capital_available"] = _money(rupee.group(0))

    city = re.search(
        r"\b(hyderabad|chennai|bengaluru|bangalore|mumbai|delhi|pune|kolkata|ahmedabad|jaipur|kochi|gurugram|noida)\b",
        low,
    )
    if city:
        known["location"] = city.group(1).title()
        entities.append(city.group(1).title())

    if "branch" in low:
        known["expansion_type"] = "new_branch"
        entities.append("new_branch")
    elif "store" in low:
        known["expansion_type"] = "new_store"
        entities.append("new_store")

    if any(x in low for x in ("growth", "scale", "expand")):
        objectives.append("growth")
    if any(x in low for x in ("profit", "profitable", "return", "roi")):
        objectives.append("return")
    if any(x in low for x in ("safe", "low risk", "conservative", "preserve cash")):
        constraints.append("capital_preservation")

    required = [
        ("capital_available", "Available capital"),
        ("investment_required", "Expected investment required"),
        ("monthly_revenue", "Expected monthly revenue after the decision"),
        ("monthly_operating_cost", "Expected monthly operating cost"),
        ("gross_margin_pct", "Expected gross margin"),
        ("horizon_months", "Decision horizon"),
        ("risk_tolerance", "Risk tolerance"),
    ]
    missing = [label for key, label in required if getattr(BusinessDecisionInput(), key, None) is None and key not in known]

    return {
        "decision_type": decision_type,
        "problem_summary": p,
        "known_information": known,
        "missing_information": missing,
        "entities": entities,
        "constraints": constraints,
        "objectives": objectives,
        "priorities": objectives[:],
    }


def _assumption(inputs: BusinessDecisionInput, assumptions: Dict[str, float], key: str, default: float) -> float:
    value = getattr(inputs, key, None)
    if value is not None:
        return float(value)
    if key in assumptions:
        return float(assumptions[key])
    return float(default)


def _scenario(inputs: BusinessDecisionInput, assumptions: Dict[str, float], scenario: str) -> Dict[str, Any]:
    multipliers = {
        "conservative": {"revenue": 0.75, "growth": 0.50, "cost": 1.15},
        "base": {"revenue": 1.00, "growth": 1.00, "cost": 1.00},
        "aggressive": {"revenue": 1.25, "growth": 1.25, "cost": 1.10},
    }
    mult = multipliers[scenario]
    investment = _assumption(inputs, assumptions, "investment_required", 0.0)
    revenue = _assumption(inputs, assumptions, "monthly_revenue", 0.0) * mult["revenue"]
    cost = _assumption(inputs, assumptions, "monthly_operating_cost", 0.0) * mult["cost"]
    margin = _assumption(inputs, assumptions, "gross_margin_pct", 40.0)
    growth = _assumption(inputs, assumptions, "monthly_growth_pct", 2.0) * mult["growth"]
    horizon = inputs.horizon_months

    gross_profit = revenue * margin / 100.0
    monthly_profit = gross_profit - cost
    cash_flows = []
    cumulative = -investment
    payback_month = None

    for month in range(1, horizon + 1):
        rev_m = revenue * ((1 + growth / 100.0) ** (month - 1))
        profit_m = rev_m * margin / 100.0 - cost
        cumulative += profit_m
        cash_flows.append(profit_m)
        if cumulative >= 0 and payback_month is None:
            payback_month = month

    total_profit = sum(cash_flows)
    roi_pct = ((total_profit - investment) / investment * 100.0) if investment > 0 else None
    break_even_month = payback_month
    terminal_monthly_profit = cash_flows[-1] if cash_flows else 0.0

    capital = _assumption(inputs, assumptions, "capital_available", 0.0)
    reserve_months = _assumption(inputs, assumptions, "working_capital_months", 6.0)
    reserve = max(cost * reserve_months, 0.0)
    cash_required = investment + reserve
    capital_coverage_pct = (capital / cash_required * 100.0) if cash_required else 100.0

    return {
        "scenario": scenario,
        "investment": round(investment, 2),
        "monthly_revenue_start": round(revenue, 2),
        "monthly_operating_cost": round(cost, 2),
        "gross_margin_pct": round(margin, 2),
        "monthly_growth_pct": round(growth, 2),
        "horizon_months": horizon,
        "total_profit": round(total_profit, 2),
        "terminal_monthly_profit": round(terminal_monthly_profit, 2),
        "roi_pct": round(roi_pct, 2) if roi_pct is not None else None,
        "payback_month": payback_month,
        "working_capital_reserve": round(reserve, 2),
        "cash_required": round(cash_required, 2),
        "capital_coverage_pct": round(capital_coverage_pct, 2),
        "cash_shortfall": round(max(cash_required - capital, 0.0), 2),
    }


def simulate_decision(inputs: BusinessDecisionInput, assumptions: Dict[str, float]) -> Dict[str, Any]:
    scenarios = [_scenario(inputs, assumptions, s) for s in ("conservative", "base", "aggressive")]
    risk = risk_score(inputs, scenarios)
    recommendation = recommend(inputs, scenarios, risk)
    return {
        "inputs": inputs.model_dump(),
        "assumptions": assumptions,
        "scenarios": scenarios,
        "risk": risk,
        "recommendation": recommendation,
        "deterministic": True,
    }


def risk_score(inputs: BusinessDecisionInput, scenarios: List[Dict[str, Any]]) -> Dict[str, Any]:
    base = scenarios[1]
    score = 0.0
    reasons = []
    if base["cash_shortfall"] > 0:
        score += 35
        reasons.append("Required investment plus reserve exceeds available capital.")
    if base["payback_month"] is None:
        score += 30
        reasons.append("Base-case payback is not reached within the selected horizon.")
    elif base["payback_month"] > inputs.horizon_months * 0.75:
        score += 15
        reasons.append("Payback occurs late in the decision horizon.")
    spread = abs(scenarios[2]["total_profit"] - scenarios[0]["total_profit"])
    if base["total_profit"] and spread > abs(base["total_profit"]) * 1.0:
        score += 20
        reasons.append("Outcome is highly sensitive to operating assumptions.")
    score = min(100.0, round(score, 1))
    return {"score": score, "band": "high" if score >= 60 else "medium" if score >= 30 else "low", "reasons": reasons}


def recommend(inputs: BusinessDecisionInput, scenarios: List[Dict[str, Any]], risk: Dict[str, Any]) -> Dict[str, Any]:
    base = scenarios[1]
    if base["cash_shortfall"] > 0:
        action = "defer_or_reduce_scope"
        rationale = "The modeled investment does not fit the available capital after the working-capital reserve."
    elif risk["band"] == "high":
        action = "stage_the_investment"
        rationale = "The modeled outcome has material downside sensitivity; stage-gating reduces irreversible exposure."
    elif base["payback_month"] is None:
        action = "improve_unit_economics"
        rationale = "The base case does not recover the initial investment within the selected horizon."
    else:
        action = "proceed_with_controls"
        rationale = "The base case is financially viable under the stated assumptions, subject to monitoring the downside case."
    return {"action": action, "rationale": rationale, "confidence": "model-based", "risk_band": risk["band"]}


def apply_changes(inputs: BusinessDecisionInput, changes: Dict[str, float]) -> BusinessDecisionInput:
    data = inputs.model_dump()
    for key, value in changes.items():
        if key not in data:
            raise ValueError(f"Unknown decision input: {key}")
        data[key] = value
    return BusinessDecisionInput(**data)


def stress_decision(inputs: BusinessDecisionInput, assumptions: Dict[str, float], shocks: Dict[str, float]) -> Dict[str, Any]:
    base_assumptions = dict(assumptions)
    # Shocks are explicit multiplicative factors, e.g. revenue_multiplier=0.8.
    if "revenue_multiplier" in shocks:
        base_assumptions["monthly_revenue"] = _assumption(inputs, assumptions, "monthly_revenue", 0.0) * shocks["revenue_multiplier"]
    if "cost_multiplier" in shocks:
        base_assumptions["monthly_operating_cost"] = _assumption(inputs, assumptions, "monthly_operating_cost", 0.0) * shocks["cost_multiplier"]
    if "growth_multiplier" in shocks:
        base_assumptions["monthly_growth_pct"] = _assumption(inputs, assumptions, "monthly_growth_pct", 2.0) * shocks["growth_multiplier"]
    result = simulate_decision(inputs, base_assumptions)
    result["stress_shocks"] = shocks
    return result
