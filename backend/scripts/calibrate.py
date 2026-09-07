"""
One-off calibration: bisection-search Review's service time so the engine's
own baseline cycle time lands near the hackathon pitch's target (~11.8 days),
then honestly report what the hire-into-Review and reallocate scenarios
actually produce. Run once to pick seed.py's numbers — not called at runtime.
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.models import Stage, CompanyConfig
from app.engine.simulate import simulate

TARGET_BASELINE_DAYS = 11.8


def build_config(review_service_time: float) -> CompanyConfig:
    return CompanyConfig(
        stages=[
            Stage(name="Intake", headcount=2, service_time_mean=1.2, service_time_cv=1.0),
            Stage(name="Design", headcount=3, service_time_mean=2.25, service_time_cv=1.0),
            Stage(name="Build", headcount=5, service_time_mean=4.0, service_time_cv=1.0),
            Stage(name="Review", headcount=2, service_time_mean=review_service_time, service_time_cv=1.0),
            Stage(name="QA", headcount=3, service_time_mean=2.4, service_time_cv=1.0),
            Stage(name="Ship", headcount=2, service_time_mean=1.2, service_time_cv=1.0),
        ],
        arrival_rate=8.0,
        arrival_cv=1.0,
        cost_per_head=1_200_000.0,
    )


def cycle_time_for(review_service_time: float) -> float:
    return simulate(build_config(review_service_time)).cycle_time_days


def main():
    lo, hi = 1.0, 1.98  # keep rho < 1 given headcount=2, arrival=8/day
    for _ in range(80):
        mid = (lo + hi) / 2
        if cycle_time_for(mid) < TARGET_BASELINE_DAYS:
            lo = mid
        else:
            hi = mid

    best = (lo + hi) / 2
    result = simulate(build_config(best), label="baseline (calibrated)")

    print(f"Calibrated Review service_time_mean = {best:.4f} hours")
    print(f"Baseline cycle time = {result.cycle_time_days} days\n")
    for s in result.per_stage:
        print(f"  {s.name:8s} headcount={s.headcount}  util={s.utilization:.2%}  wait={s.wait_time_days:.2f}d  bottleneck={s.is_bottleneck}")

    hire_cfg = build_config(best)
    for s in hire_cfg.stages:
        if s.name == "Review":
            s.headcount += 1
    hire_result = simulate(hire_cfg, label="hire +1 Review")
    print(f"\nHire +1 into Review: {hire_result.cycle_time_days} days")

    realloc_cfg = build_config(best)
    for s in realloc_cfg.stages:
        if s.name == "Design":
            s.headcount -= 1
        if s.name == "Review":
            s.headcount += 1
    realloc_result = simulate(realloc_cfg, label="reallocate Design->Review")
    print(f"Reallocate Design->Review: {realloc_result.cycle_time_days} days")

    hire_gain = result.cycle_time_days - hire_result.cycle_time_days
    realloc_gain = result.cycle_time_days - realloc_result.cycle_time_days
    if hire_gain > 0:
        capture_pct = realloc_gain / hire_gain * 100
        print(f"\nReallocation captures {capture_pct:.1f}% of hiring's benefit, for zero cost")


if __name__ == "__main__":
    main()
