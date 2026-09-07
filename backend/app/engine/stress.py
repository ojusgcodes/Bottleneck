"""
Red Team: build a stressed variant of a config (demand spikes, headcount
gets cut) and run it through the same engine — no separate code path, no
special-casing, just the same simulate() under worse inputs.
"""
import copy

from ..models import CompanyConfig, StressParams, ScenarioResult
from .simulate import simulate


def apply_stress(config: CompanyConfig, stress: StressParams) -> CompanyConfig:
    cfg = copy.deepcopy(config)
    cfg.arrival_rate = cfg.arrival_rate * stress.demand_multiplier
    for stage in cfg.stages:
        stage.headcount = max(1, round(stage.headcount * stress.resource_multiplier))
    return cfg


def stress_test(config: CompanyConfig, stress: StressParams) -> ScenarioResult:
    stressed_cfg = apply_stress(config, stress)
    return simulate(stressed_cfg, label="Stress test")
