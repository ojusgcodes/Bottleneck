"""
Runs one CompanyConfig through every stage in sequence and computes the
end-to-end cycle time. Each stage is modeled as an independent G/G/c queue;
a work item's total time is the sum of (wait + service) across every stage
it passes through. Rework sends a fraction of items back through the SAME
stage before moving on, which inflates that stage's effective arrival rate.
"""
from typing import List

from ..models import CompanyConfig, ScenarioResult, StageStat
from . import queueing


def simulate(config: CompanyConfig, label: str = "Scenario") -> ScenarioResult:
    per_stage: List[StageStat] = []
    total_days = 0.0
    bottleneck_name = ""
    bottleneck_util = -1.0

    for stage in config.stages:
        effective_arrival = (
            config.arrival_rate / (1.0 - stage.rework_rate)
            if stage.rework_rate < 1
            else config.arrival_rate
        )

        util = queueing.utilization(stage.headcount, stage.service_time_mean, effective_arrival)
        wait = queueing.wait_time_days(
            stage.headcount,
            stage.service_time_mean,
            effective_arrival,
            config.arrival_cv,
            stage.service_time_cv,
        )
        service_days = stage.service_time_mean / queueing.HOURS_PER_DAY
        stage_total = wait + service_days
        total_days += stage_total

        per_stage.append(
            StageStat(
                name=stage.name,
                headcount=stage.headcount,
                utilization=round(util, 4),
                wait_time_days=round(wait, 4),
                service_time_days=round(service_days, 4),
                is_bottleneck=False,
            )
        )

        if util > bottleneck_util:
            bottleneck_util = util
            bottleneck_name = stage.name

    for s in per_stage:
        if s.name == bottleneck_name:
            s.is_bottleneck = True

    total_headcount = sum(s.headcount for s in config.stages)

    return ScenarioResult(
        label=label,
        cycle_time_days=round(total_days, 2),
        bottleneck_stage=bottleneck_name,
        per_stage=per_stage,
        total_headcount=total_headcount,
    )
