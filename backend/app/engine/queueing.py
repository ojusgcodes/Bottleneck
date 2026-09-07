"""
Queueing math: Kingman's approximation for a G/G/c queue at each workflow
stage.

    Wq ≈ (rho / (1 - rho)) * ((ca^2 + cs^2) / 2) * (service_time / c)

where:
    rho  = utilization = (arrival_rate * service_time) / (c * capacity_per_server)
    ca^2 = coefficient of variation squared of inter-arrival times
    cs^2 = coefficient of variation squared of service times
    c    = number of parallel servers (headcount) at the stage

All time units are converted to days (assuming an 8-hour work day) so cycle
time is expressed in calendar days — what a manager actually cares about.
This is the ONLY place in the codebase that calculates a wait time or
utilization number. Nothing upstream of this file may write a number of its
own; the guardrail exists specifically to enforce that boundary.
"""

HOURS_PER_DAY = 8.0
MAX_UTILIZATION = 0.995  # clamp so rho -> 1 never divides by zero


def utilization(headcount: int, service_time_hours: float, arrival_rate_per_day: float) -> float:
    """Fraction of available capacity being consumed at this stage."""
    if headcount <= 0:
        raise ValueError("headcount must be positive")
    if service_time_hours <= 0:
        raise ValueError("service_time_hours must be positive")
    capacity_per_day = headcount * HOURS_PER_DAY / service_time_hours
    return arrival_rate_per_day / capacity_per_day


def wait_time_days(
    headcount: int,
    service_time_hours: float,
    arrival_rate_per_day: float,
    arrival_cv: float,
    service_cv: float,
) -> float:
    """Expected time a work item spends waiting before this stage starts on
    it, in days, via Kingman's approximation. Clamped so a saturated stage
    (rho -> 1) produces a very large but finite number instead of crashing."""
    rho = min(utilization(headcount, service_time_hours, arrival_rate_per_day), MAX_UTILIZATION)
    service_time_days = service_time_hours / HOURS_PER_DAY

    variability_term = (arrival_cv ** 2 + service_cv ** 2) / 2.0
    wq = (rho / (1.0 - rho)) * variability_term * (service_time_days / headcount)
    return wq
