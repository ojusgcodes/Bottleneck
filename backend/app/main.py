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
from .seed import default_company

app = FastAPI(title="Bottleneck API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "bottleneck-api"}


@app.get("/seed")
def get_seed():
    """Default demo company config, for the frontend to pre-fill the form."""
    return default_company()


@app.post("/simulate")
def api_simulate(config: CompanyConfig):
    return simulate(config, label="Baseline")


@app.post("/strategies")
def api_strategies(req: StrategyRequest):
    return generate_strategies(req.config)


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
    return stress_test(req.config, req.stress)


@app.post("/adapt")
def api_adapt(req: StressRequest):
    target = simulate(req.config, label="target-reference").cycle_time_days
    return adapt_plan(req.config, req.stress, target_days=target)


@app.post("/explain")
def api_explain(req: ExplainRequest):
    return explain_fn(req.context, req.question)
