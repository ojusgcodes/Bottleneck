"""
The demo company used throughout the pitch: 6 sequential stages, Review is
the calibrated bottleneck. These service times were tuned (see
scripts/calibrate.py) so Review sits right at the edge of the utilization
cliff at baseline — the same "flat, then nearly vertical" shape from the
queueing theory explainer.

Baseline (as of this calibration): 5.29 days, Review at ~95.7% utilized.
Hiring one more person into Review: 2.88 days.
Moving one existing person from Design into Review: 2.93 days — about 98%
of hiring's benefit, for zero cost, because Design had slack to give.

These numbers are live — re-run scripts/calibrate.py any time the stage
parameters below change, and update the pitch deck to match whatever the
app actually outputs before presenting.
"""
from .models import Stage, CompanyConfig


def default_company() -> CompanyConfig:
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
