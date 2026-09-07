"""
Two ready-made demo companies, proving the same engine works on two
unrelated domains without changing a line of code — only the numbers
change. This is the concrete evidence behind "this isn't a hiring
calculator, it's a general decision simulator."

Both were tuned with scripts/calibrate.py so their bottleneck stage sits
right at the edge of the utilization cliff — the "flat, then nearly
vertical" shape from the queueing theory explainer.
"""
from .models import Stage, CompanyConfig


def default_company() -> CompanyConfig:
    """
    Software team, 6 sequential stages. Review is the bottleneck.

    Baseline: 5.29 days, Review at ~95.7% utilized.
    Hire one more into Review: 2.88 days.
    Move one existing person from Design into Review: 2.93 days — about
    98% of hiring's benefit, for zero cost, because Design had slack to give.
    """
    return CompanyConfig(
        stages=[
            Stage(name="Intake", headcount=4, service_time_mean=2.2, service_time_cv=1.0),
            Stage(name="Design", headcount=6, service_time_mean=3.0, service_time_cv=1.0),
            Stage(name="Build", headcount=8, service_time_mean=5.0, service_time_cv=1.0),
            Stage(name="Review", headcount=3, service_time_mean=2.87, service_time_cv=1.0),
            Stage(name="QA", headcount=5, service_time_mean=3.0, service_time_cv=1.0),
            Stage(name="Ship", headcount=3, service_time_mean=1.5, service_time_cv=1.0),
        ],
        arrival_rate=8.0,
        arrival_cv=1.0,
        cost_per_head=1_200_000.0,
    )


def expansion_company() -> CompanyConfig:
    """
    Same engine, a business-expansion / supply-chain question instead of a
    software team: a Delhi-based operation shipping nationally, where
    Regional Transport (everything routes through one hub) is the
    bottleneck — the "should we open a UP hub" decision.

    Baseline: 3.34 days, Regional Transport at 96% utilized.
    Hire into Regional Transport (open the UP hub): 1.22 days.
    Move one person from Order Intake — badly underused at 25% — into
    Regional Transport instead: 1.23 days, for zero cost. Same free-capacity
    story as the software scenario, different domain entirely.
    """
    return CompanyConfig(
        stages=[
            Stage(name="Order Intake", headcount=5, service_time_mean=1.0, service_time_cv=1.0),
            Stage(name="Warehouse Pick and Pack", headcount=8, service_time_mean=2.5, service_time_cv=1.0),
            Stage(name="Regional Transport", headcount=3, service_time_mean=2.3039, service_time_cv=1.0),
            Stage(name="Last-Mile Delivery", headcount=6, service_time_mean=2.0, service_time_cv=1.0),
        ],
        arrival_rate=10.0,
        arrival_cv=1.0,
        cost_per_head=900_000.0,
    )


SCENARIOS = {
    "software": default_company,
    "expansion": expansion_company,
}
