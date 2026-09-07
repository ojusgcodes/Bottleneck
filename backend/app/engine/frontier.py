"""
Trade-off frontier: sweep one stage's headcount across a range and return
the resulting cycle time + incremental cost at every point. This is what
proves diminishing returns — the Nth hire buys more than the (N+1)th.
"""
from typing import List
import copy

from ..models import CompanyConfig, ScenarioResult
from .simulate import simulate


def sweep_headcount(base_config: CompanyConfig, stage_name: str, hc_range: range) -> List[ScenarioResult]:
    results = []
    base_headcount = sum(s.headcount for s in base_config.stages)

    for hc in hc_range:
        cfg = copy.deepcopy(base_config)
        for stage in cfg.stages:
            if stage.name == stage_name:
                stage.headcount = hc

        new_headcount = sum(s.headcount for s in cfg.stages)
        added = max(new_headcount - base_headcount, 0)

        result = simulate(cfg, label=f"{stage_name} = {hc}")
        result.incremental_cost = added * base_config.cost_per_head
        results.append(result)

    return results
