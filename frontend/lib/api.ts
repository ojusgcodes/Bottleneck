import {
  CompanyConfig,
  ScenarioResult,
  TradeoffFinding,
  RippleResult,
  AdaptResult,
  ExplainResult,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function getSeed(scenario: string = "software"): Promise<CompanyConfig> {
  const res = await fetch(`${BASE_URL}/seed?scenario=${encodeURIComponent(scenario)}`);
  if (!res.ok) throw new Error("Failed to load seed config");
  return res.json();
}

export async function getAvailableScenarios(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/seed/scenarios`);
  if (!res.ok) throw new Error("Failed to load scenario list");
  return res.json();
}

export function simulate(config: CompanyConfig): Promise<ScenarioResult> {
  return postJSON("/simulate", config);
}

export function getStrategies(config: CompanyConfig): Promise<ScenarioResult[]> {
  return postJSON("/strategies", { config, objective: "minimize_cycle_time" });
}

export function getTradeoffs(config: CompanyConfig): Promise<TradeoffFinding[]> {
  return postJSON("/tradeoffs", config);
}

export function getRipple(
  config: CompanyConfig,
  stage_name: string,
  new_headcount: number
): Promise<RippleResult> {
  return postJSON("/ripple", { config, stage_name, new_headcount });
}

export function getStressTest(
  config: CompanyConfig,
  demand_multiplier = 1.3,
  resource_multiplier = 0.85
): Promise<ScenarioResult> {
  return postJSON("/stress-test", {
    config,
    stress: { demand_multiplier, resource_multiplier },
  });
}

export function getAdapt(
  config: CompanyConfig,
  demand_multiplier = 1.3,
  resource_multiplier = 0.85
): Promise<AdaptResult> {
  return postJSON("/adapt", {
    config,
    stress: { demand_multiplier, resource_multiplier },
  });
}

export function explain(context: unknown, question?: string): Promise<ExplainResult> {
  return postJSON("/explain", { context, question });
}
