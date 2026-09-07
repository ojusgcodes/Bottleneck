export interface Stage {
  name: string;
  headcount: number;
  service_time_mean: number;
  service_time_cv: number;
  rework_rate: number;
}

export interface CompanyConfig {
  stages: Stage[];
  arrival_rate: number;
  arrival_cv: number;
  cost_per_head: number;
}

export interface StageStat {
  name: string;
  headcount: number;
  utilization: number;
  wait_time_days: number;
  service_time_days: number;
  is_bottleneck: boolean;
}

export interface ScenarioResult {
  label: string;
  cycle_time_days: number;
  bottleneck_stage: string;
  per_stage: StageStat[];
  total_headcount: number;
  incremental_cost: number;
}

export interface TradeoffFinding {
  type: string;
  stage: string;
  message: string;
}

export interface RippleResult {
  before: ScenarioResult;
  after: ScenarioResult;
  delta_cycle_time_days: number;
  changed_stage: string;
}

export interface AdaptResult {
  original_normal: ScenarioResult;
  original_stress: ScenarioResult;
  adapted_normal: ScenarioResult;
  adapted_stress: ScenarioResult;
  original_normal_score: number;
  original_stress_score: number;
  adapted_normal_score: number;
  adapted_stress_score: number;
}

export interface ExplainResult {
  explanation: string;
  numbers_removed: string[];
  numbers_verified: boolean;
  source: "llm" | "fallback";
}
