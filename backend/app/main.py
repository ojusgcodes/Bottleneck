import copy

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import CompanyConfig, StrategyRequest, RippleRequest, StressRequest, ExplainRequest
from .engine.simulate import simulate
from .engine.strategies import generate_strategies
from .engine.tradeoffs import find_hidden_tradeoffs
from .engine.stress import stress_test
from .engine.adapt import adapt_plan
from .explain import explain as explain_fn
from .seed import default_company, SCENARIOS
from . import storage

app = FastAPI(
    title="Bottleneck API",
    version="0.2.0",
    description=(
        "Deterministic decision-simulation engine. Every number returned by "
        "any route traces back to app/engine/queueing.py — nothing here is "
        "guessed by an AI. /explain is the one exception: it writes prose "
        "only, and even that is checked against the numbers before it's "
        "returned. See /docs for the interactive schema."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    storage.init_db()


@app.get("/")
def root():
    return {"status": "ok", "service": "bottleneck-api"}


@app.get("/seed")
def get_seed(scenario: str = "software"):
    """
    Demo company config, for the frontend to pre-fill the form.

    `scenario` picks which ready-made example to load — this is the proof
    that the engine is a general decision simulator, not a hiring
    calculator: same code, two unrelated domains, just different numbers.
    """
    if scenario not in SCENARIOS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown scenario '{scenario}'. Available: {list(SCENARIOS.keys())}",
        )
    return SCENARIOS[scenario]()


@app.get("/seed/scenarios")
def api_available_scenarios():
    """Names of the ready-made demo datasets /seed accepts — lets the
    frontend build a scenario picker without hardcoding the list twice.
    Deliberately not under /scenarios/* — that prefix is reserved for the
    persisted run history, a different concept entirely."""
    return list(SCENARIOS.keys())


@app.post("/simulate")
def api_simulate(config: CompanyConfig):
    result = simulate(config, label="Baseline")
    storage.save_scenario(result.label, config.model_dump(), result.model_dump())
    return result


@app.post("/strategies")
def api_strategies(req: StrategyRequest):
    results = generate_strategies(req.config)
    for r in results:
        storage.save_scenario(r.label, req.config.model_dump(), r.model_dump())
    return results


@app.post("/tradeoffs")
def api_tradeoffs(config: CompanyConfig):
    return find_hidden_tradeoffs(config)


@app.post("/ripple")
def api_ripple(req: RippleRequest):
    before = simulate(req.config, label="before")

    after_cfg = copy.deepcopy(req.config)
    found = False
    for stage in after_cfg.stages:
        if stage.name == req.stage_name:
            stage.headcount = req.new_headcount
            found = True
    if not found:
        raise HTTPException(status_code=404, detail=f"No stage named {req.stage_name}")

    after = simulate(after_cfg, label="after")

    return {
        "before": before,
        "after": after,
        "delta_cycle_time_days": round(after.cycle_time_days - before.cycle_time_days, 2),
        "changed_stage": req.stage_name,
    }


@app.post("/stress-test")
def api_stress_test(req: StressRequest):
    result = stress_test(req.config, req.stress)
    storage.save_scenario(result.label, req.config.model_dump(), result.model_dump())
    return result


@app.post("/adapt")
def api_adapt(req: StressRequest):
    target = simulate(req.config, label="target-reference").cycle_time_days
    result = adapt_plan(req.config, req.stress, target_days=target)
    storage.save_scenario(
        "Adapted plan",
        req.config.model_dump(),
        {
            "adapted_normal": result["adapted_normal"].model_dump(),
            "adapted_stress": result["adapted_stress"].model_dump(),
            "adapted_stress_score": result["adapted_stress_score"],
        },
    )
    return result


@app.post("/explain")
def api_explain(req: ExplainRequest):
    return explain_fn(req.context, req.question)


@app.get("/scenarios")
def api_list_scenarios(limit: int = 50):
    """Every simulate / strategies / stress-test / adapt run gets saved
    automatically — this is the history, not something you opt into."""
    return storage.list_scenarios(limit)


@app.get("/scenarios/{scenario_id}")
def api_get_scenario(scenario_id: int):
    scenario = storage.get_scenario(scenario_id)
    if scenario is None:
        raise HTTPException(status_code=404, detail=f"No scenario with id {scenario_id}")
    return scenario


@app.delete("/scenarios/{scenario_id}")
def api_delete_scenario(scenario_id: int):
    deleted = storage.delete_scenario(scenario_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"No scenario with id {scenario_id}")
    return {"deleted": scenario_id}
