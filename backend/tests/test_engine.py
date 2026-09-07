import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.seed import default_company
from app.engine.simulate import simulate
from app.engine.strategies import generate_strategies
from app.engine.stress import stress_test
from app.engine.adapt import adapt_plan
from app.engine.tradeoffs import find_hidden_tradeoffs
from app.models import StressParams
from app.guardrail.guardrail import enforce


def test_baseline_has_review_bottleneck():
    config = default_company()
    result = simulate(config, label="baseline")
    assert result.bottleneck_stage == "Review"
    assert result.cycle_time_days > 0
    print(f"Baseline: {result.cycle_time_days} days, bottleneck={result.bottleneck_stage}")


def test_strategies_beat_or_match_baseline():
    config = default_company()
    strategies = generate_strategies(config)
    baseline = strategies[0]
    for s in strategies[1:]:
        assert s.cycle_time_days <= baseline.cycle_time_days
        print(f"{s.label}: {s.cycle_time_days} days (cost {s.incremental_cost})")


def test_stress_makes_things_worse():
    config = default_company()
    baseline = simulate(config)
    stress = StressParams(demand_multiplier=1.3, resource_multiplier=0.85)
    stressed = stress_test(config, stress)
    assert stressed.cycle_time_days > baseline.cycle_time_days
    print(f"Stress test: {baseline.cycle_time_days} -> {stressed.cycle_time_days} days")


def test_adapt_improves_stress_score():
    config = default_company()
    baseline = simulate(config)
    stress = StressParams(demand_multiplier=1.3, resource_multiplier=0.85)
    result = adapt_plan(config, stress, target_days=baseline.cycle_time_days)
    assert result["adapted_stress_score"] >= result["original_stress_score"]
    print(f"Stress score: {result['original_stress_score']} -> {result['adapted_stress_score']}")


def test_hidden_tradeoffs_finds_something():
    config = default_company()
    findings = find_hidden_tradeoffs(config)
    assert len(findings) > 0
    for f in findings:
        print(f" - {f['message']}")


def test_guardrail_strips_fabricated_numbers():
    context = {"cycle_time_days": 5.29, "bottleneck_stage": "Review"}
    text = "This plan delivers in 5.29 days, and next quarter revenue will be 42 million."
    cleaned, removed = enforce(text, context)
    assert "5.29" in cleaned
    assert "42" in removed
    assert "[unverified]" in cleaned
    print(f"Guardrail removed: {removed}")
    print(f"Cleaned text: {cleaned}")


if __name__ == "__main__":
    tests = [
        test_baseline_has_review_bottleneck,
        test_strategies_beat_or_match_baseline,
        test_stress_makes_things_worse,
        test_adapt_improves_stress_score,
        test_hidden_tradeoffs_finds_something,
        test_guardrail_strips_fabricated_numbers,
    ]
    for t in tests:
        print(f"\n--- {t.__name__} ---")
        t()
    print("\nAll tests passed.")
