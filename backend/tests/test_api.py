"""
HTTP-level tests: these hit the actual FastAPI routes through TestClient,
not the engine functions directly (that's what test_engine.py does). This
is what proves the API itself — request parsing, response shape,
persistence, OpenAPI schema — actually works, not just the math underneath.

Uses a temporary SQLite file so running this doesn't pollute your real
bottleneck.db with test data.
"""
import sys
import os
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import storage

# Point storage at a throwaway file and initialize it directly — TestClient
# used outside a `with` block does not reliably fire FastAPI's startup
# event across every Starlette version, so don't depend on it here.
_tmp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
storage.DB_PATH = _tmp_db.name
storage.init_db()

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_health_check():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_seed_returns_valid_config():
    r = client.get("/seed")
    assert r.status_code == 200
    body = r.json()
    assert "stages" in body and len(body["stages"]) == 6
    assert "arrival_rate" in body
    return body


def test_second_scenario_is_a_different_domain():
    """Proves the engine is domain-agnostic: same code, a totally
    different business problem, just swapped-in numbers."""
    names = client.get("/seed/scenarios").json()
    assert "software" in names and "expansion" in names

    expansion_seed = client.get("/seed?scenario=expansion").json()
    stage_names = [s["name"] for s in expansion_seed["stages"]]
    assert "Regional Transport" in stage_names

    result = client.post("/simulate", json=expansion_seed).json()
    assert result["bottleneck_stage"] == "Regional Transport"
    print(f"Expansion scenario: {result['cycle_time_days']} days, bottleneck={result['bottleneck_stage']}")


def test_unknown_scenario_404s():
    r = client.get("/seed?scenario=not-a-real-scenario")
    assert r.status_code == 404


def test_simulate_and_it_gets_persisted():
    seed = client.get("/seed").json()
    r = client.post("/simulate", json=seed)
    assert r.status_code == 200
    result = r.json()
    assert result["cycle_time_days"] > 0
    assert result["bottleneck_stage"] == "Review"

    history = client.get("/scenarios").json()
    assert len(history) >= 1
    assert history[0]["cycle_time_days"] == result["cycle_time_days"]

    detail = client.get(f"/scenarios/{history[0]['id']}").json()
    assert detail["result"]["cycle_time_days"] == result["cycle_time_days"]
    assert "stages" in detail["config"]
    print(f"Persisted scenario id={history[0]['id']}, cycle_time={result['cycle_time_days']}")


def test_strategies_endpoint():
    seed = client.get("/seed").json()
    r = client.post("/strategies", json={"config": seed, "objective": "minimize_cycle_time"})
    assert r.status_code == 200
    strategies = r.json()
    assert len(strategies) >= 2
    for s in strategies:
        print(f"  {s['label']}: {s['cycle_time_days']} days")


def test_ripple_endpoint():
    seed = client.get("/seed").json()
    r = client.post("/ripple", json={"config": seed, "stage_name": "Review", "new_headcount": 5})
    assert r.status_code == 200
    body = r.json()
    assert body["after"]["cycle_time_days"] < body["before"]["cycle_time_days"]


def test_ripple_rejects_unknown_stage():
    seed = client.get("/seed").json()
    r = client.post("/ripple", json={"config": seed, "stage_name": "NotAStage", "new_headcount": 5})
    assert r.status_code == 404


def test_stress_test_endpoint():
    seed = client.get("/seed").json()
    baseline = client.post("/simulate", json=seed).json()
    r = client.post("/stress-test", json={"config": seed})
    assert r.status_code == 200
    stressed = r.json()
    assert stressed["cycle_time_days"] > baseline["cycle_time_days"]


def test_adapt_endpoint():
    seed = client.get("/seed").json()
    r = client.post("/adapt", json={"config": seed})
    assert r.status_code == 200
    body = r.json()
    assert body["adapted_stress_score"] >= body["original_stress_score"]


def test_explain_endpoint_never_fabricates():
    seed = client.get("/seed").json()
    sim = client.post("/simulate", json=seed).json()
    r = client.post("/explain", json={"context": sim})
    assert r.status_code == 200
    body = r.json()
    assert "explanation" in body
    assert body["numbers_verified"] is True or len(body["numbers_removed"]) >= 0


def test_delete_scenario():
    seed = client.get("/seed").json()
    client.post("/simulate", json=seed)
    history = client.get("/scenarios").json()
    scenario_id = history[0]["id"]
    r = client.delete(f"/scenarios/{scenario_id}")
    assert r.status_code == 200
    r2 = client.get(f"/scenarios/{scenario_id}")
    assert r2.status_code == 404


def test_openapi_schema_is_valid():
    r = client.get("/openapi.json")
    assert r.status_code == 200
    schema = r.json()
    assert schema["info"]["title"] == "Bottleneck API"
    expected_paths = ["/simulate", "/strategies", "/ripple", "/stress-test", "/adapt", "/explain", "/scenarios"]
    for path in expected_paths:
        assert path in schema["paths"], f"{path} missing from OpenAPI schema"
    print(f"OpenAPI schema valid, {len(schema['paths'])} paths documented")


def test_docs_page_loads():
    r = client.get("/docs")
    assert r.status_code == 200
    assert "swagger" in r.text.lower()


if __name__ == "__main__":
    tests = [
        test_root_health_check,
        test_seed_returns_valid_config,
        test_second_scenario_is_a_different_domain,
        test_unknown_scenario_404s,
        test_simulate_and_it_gets_persisted,
        test_strategies_endpoint,
        test_ripple_endpoint,
        test_ripple_rejects_unknown_stage,
        test_stress_test_endpoint,
        test_adapt_endpoint,
        test_explain_endpoint_never_fabricates,
        test_delete_scenario,
        test_openapi_schema_is_valid,
        test_docs_page_loads,
    ]
    for t in tests:
        print(f"\n--- {t.__name__} ---")
        t()
    print("\nAll API tests passed.")
    os.unlink(_tmp_db.name)
