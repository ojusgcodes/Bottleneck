"""
Shared data contract between the engine, the API, and the guardrail.
Every number that ever reaches the frontend traces back to a ScenarioResult
produced somewhere in this file's types.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class Stage(BaseModel):
    name: str
    headcount: int = Field(gt=0, description="Number of people working this stage in parallel")
    service_time_mean: float = Field(gt=0, description="Average hours to process one work item at this stage")
    service_time_cv: float = Field(default=1.0, ge=0, description="Coefficient of variation of service time (variability)")
    rework_rate: float = Field(default=0.0, ge=0, lt=1, description="Fraction of items sent back for rework")


class CompanyConfig(BaseModel):
    stages: List[Stage]
    arrival_rate: float = Field(gt=0, description="New work items arriving per day")
    arrival_cv: float = Field(default=1.0, ge=0, description="Coefficient of variation of arrivals")
    cost_per_head: float = Field(default=1_200_000.0, description="Fully-loaded annual cost of one additional hire")


class StageStat(BaseModel):
    name: str
    headcount: int
    utilization: float
    wait_time_days: float
    service_time_days: float
    is_bottleneck: bool = False


class ScenarioResult(BaseModel):
    label: str
    cycle_time_days: float
    bottleneck_stage: str
    per_stage: List[StageStat]
    total_headcount: int
    incremental_cost: float = 0.0


class StrategyRequest(BaseModel):
    config: CompanyConfig
    objective: str = "minimize_cycle_time"


class RippleRequest(BaseModel):
    config: CompanyConfig
    stage_name: str
    new_headcount: int = Field(gt=0)


class StressParams(BaseModel):
    demand_multiplier: float = 1.3
    resource_multiplier: float = 0.85


class StressRequest(BaseModel):
    config: CompanyConfig
    stress: StressParams = StressParams()


class ExplainRequest(BaseModel):
    context: dict
    question: Optional[str] = None
