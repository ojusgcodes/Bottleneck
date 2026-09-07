"""
Future Generator: given a base config, auto-generate a handful of named
strategies instead of one recommendation. This is what makes slide 2 true —
the user sees a menu of futures, not a single chatbot answer.
"""
from typing import List
import copy

from ..models import CompanyConfig, ScenarioResult
from .simulate import simulate


def generate_strategies(config: CompanyConfig) -> List[ScenarioResult]:
    baseline = simulate(config, label="Do nothing")
    strategies: List[ScenarioResult] = [baseline]

    # Strategy: hire into the current bottleneck
    hire_cfg = copy.deepcopy(config)
    for stage in hire_cfg.stages:
        if stage.name == baseline.bottleneck_stage:
            stage.headcount += 1
    hire_result = simulate(hire_cfg, label=f"Hire into {baseline.bottleneck_stage}")
    hire_result.incremental_cost = config.cost_per_head
    strategies.append(hire_result)

    # Strategy: reallocate one person from the least-utilized stage into the bottleneck
    least_loaded = min(baseline.per_stage, key=lambda s: s.utilization)
    if least_loaded.name != baseline.bottleneck_stage and least_loaded.headcount > 1:
        realloc_cfg = copy.deepcopy(config)
        for stage in realloc_cfg.stages:
            if stage.name == least_loaded.name:
                stage.headcount -= 1
            if stage.name == baseline.bottleneck_stage:
                stage.headcount += 1
        realloc_result = simulate(realloc_cfg, label=f"Move 1: {least_loaded.name} -> {baseline.bottleneck_stage}")
        realloc_result.incremental_cost = 0.0
        strategies.append(realloc_result)

    # Strategy: hire two into the bottleneck (aggressive)
    aggressive_cfg = copy.deepcopy(config)
    for stage in aggressive_cfg.stages:
        if stage.name == baseline.bottleneck_stage:
            stage.headcount += 2
    aggressive_result = simulate(aggressive_cfg, label=f"Hire 2 into {baseline.bottleneck_stage}")
    aggressive_result.incremental_cost = config.cost_per_head * 2
    strategies.append(aggressive_result)

    return strategies
