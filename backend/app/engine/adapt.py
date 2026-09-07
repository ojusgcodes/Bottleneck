"""
Adapt: given a plan that fails under stress, search nearby headcount
configurations for one that survives stress better, and report the
normal-vs-stress trade-off both plans make.
"""
import copy

from ..models import CompanyConfig, StressParams
from .simulate import simulate
from .stress import apply_stress


def score(cycle_time_days: float, target_days: float) -> float:
    """0-100: how close cycle time is to a target, penalizing overshoot."""
    if cycle_time_days <= target_days:
        return 100.0
    ratio = target_days / cycle_time_days
    return round(max(ratio, 0.0) * 100, 1)


def adapt_plan(config: CompanyConfig, stress: StressParams, target_days: float, max_extra_heads: int = 4) -> dict:
    normal_baseline = simulate(config, label="Normal (original)")
    stressed_baseline = simulate(apply_stress(config, stress), label="Stress (original)")

    best_cfg = config
    best_stress_result = stressed_baseline
    best_stress_score = score(stressed_baseline.cycle_time_days, target_days)

    stage_names = [s.name for s in config.stages]
    for name in stage_names:
        for extra in range(1, max_extra_heads + 1):
            candidate = copy.deepcopy(config)
            for stage in candidate.stages:
                if stage.name == name:
                    stage.headcount += extra
            stressed_candidate = apply_stress(candidate, stress)
            result = simulate(stressed_candidate, label=f"Stress ({name} +{extra})")
            s = score(result.cycle_time_days, target_days)
            if s > best_stress_score:
                best_stress_score = s
                best_stress_result = result
                best_cfg = candidate

    adapted_normal = simulate(best_cfg, label="Normal (adapted)")

    return {
        "original_normal": normal_baseline,
        "original_stress": stressed_baseline,
        "adapted_normal": adapted_normal,
        "adapted_stress": best_stress_result,
        "original_normal_score": score(normal_baseline.cycle_time_days, target_days),
        "original_stress_score": score(stressed_baseline.cycle_time_days, target_days),
        "adapted_normal_score": score(adapted_normal.cycle_time_days, target_days),
        "adapted_stress_score": best_stress_score,
    }
