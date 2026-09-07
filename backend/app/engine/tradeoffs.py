"""
Hidden Trade-offs: surface relationships the user didn't explicitly ask
about — diminishing returns on hiring, and headcount that isn't allocated
where the actual delay is.
"""
from typing import List, Dict

from ..models import CompanyConfig
from .simulate import simulate
from .frontier import sweep_headcount


def find_hidden_tradeoffs(config: CompanyConfig) -> List[Dict]:
    baseline = simulate(config, label="baseline")
    findings: List[Dict] = []

    for stage in config.stages:
        hc = stage.headcount
        points = sweep_headcount(config, stage.name, range(hc, hc + 3))
        if len(points) < 3:
            continue

        gain_next = points[0].cycle_time_days - points[1].cycle_time_days
        gain_after = points[1].cycle_time_days - points[2].cycle_time_days

        if gain_next > 0.05 and gain_after < gain_next * 0.3:
            findings.append(
                {
                    "type": "diminishing_returns",
                    "stage": stage.name,
                    "message": (
                        f"Hiring the next person into {stage.name} saves "
                        f"{gain_next:.1f} days, but the one after that only saves "
                        f"{gain_after:.1f} days — the return drops off fast."
                    ),
                }
            )

    if baseline.bottleneck_stage:
        highest_hc_stage = max(config.stages, key=lambda s: s.headcount)
        if highest_hc_stage.name != baseline.bottleneck_stage:
            findings.append(
                {
                    "type": "mislocated_focus",
                    "stage": baseline.bottleneck_stage,
                    "message": (
                        f"{highest_hc_stage.name} has the most people, but "
                        f"{baseline.bottleneck_stage} is the actual bottleneck — "
                        f"headcount isn't allocated where the delay is."
                    ),
                }
            )

    return findings
