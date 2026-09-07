/**
 * Static fallback for the landing page when the backend isn't running.
 *
 * Every figure here was produced by running backend/app/engine/queueing.py
 * on the two seed companies in backend/app/seed.py — the landing page
 * swaps these for live results the moment the API answers, so what's on
 * the marketing page is always exactly what the simulator will show.
 */
import { ScenarioResult, ScenarioName } from "./types";

export const SOFTWARE_BASELINE: ScenarioResult = {
  label: "Do nothing",
  cycle_time_days: 5.29,
  bottleneck_stage: "Review",
  total_headcount: 29,
  incremental_cost: 0,
  per_stage: [
    { name: "Intake", headcount: 4, utilization: 0.55, wait_time_days: 0.084, service_time_days: 0.275, is_bottleneck: false },
    { name: "Design", headcount: 6, utilization: 0.5, wait_time_days: 0.0625, service_time_days: 0.375, is_bottleneck: false },
    { name: "Build", headcount: 8, utilization: 0.625, wait_time_days: 0.1302, service_time_days: 0.625, is_bottleneck: false },
    { name: "Review", headcount: 3, utilization: 0.9567, wait_time_days: 2.64, service_time_days: 0.3588, is_bottleneck: true },
    { name: "QA", headcount: 5, utilization: 0.6, wait_time_days: 0.1125, service_time_days: 0.375, is_bottleneck: false },
    { name: "Ship", headcount: 3, utilization: 0.5, wait_time_days: 0.0625, service_time_days: 0.1875, is_bottleneck: false },
  ],
};

export const SOFTWARE_STRATEGIES: ScenarioResult[] = [
  SOFTWARE_BASELINE,
  {
    ...SOFTWARE_BASELINE,
    label: "Hire into Review",
    cycle_time_days: 2.88,
    total_headcount: 30,
    incremental_cost: 1_200_000,
    per_stage: SOFTWARE_BASELINE.per_stage.map((s) =>
      s.name === "Review" ? { ...s, headcount: 4, utilization: 0.7175, wait_time_days: 0.2278 } : s
    ),
  },
  {
    ...SOFTWARE_BASELINE,
    label: "Move 1: Design -> Review",
    cycle_time_days: 2.93,
    total_headcount: 29,
    incremental_cost: 0,
    per_stage: SOFTWARE_BASELINE.per_stage.map((s) =>
      s.name === "Review"
        ? { ...s, headcount: 4, utilization: 0.7175, wait_time_days: 0.2278 }
        : s.name === "Design"
        ? { ...s, headcount: 5, utilization: 0.6, wait_time_days: 0.1125 }
        : s
    ),
  },
  {
    ...SOFTWARE_BASELINE,
    label: "Hire 2 into Review",
    cycle_time_days: 2.74,
    total_headcount: 31,
    incremental_cost: 2_400_000,
    per_stage: SOFTWARE_BASELINE.per_stage.map((s) =>
      s.name === "Review" ? { ...s, headcount: 5, utilization: 0.574, wait_time_days: 0.0967 } : s
    ),
  },
];

export const EXPANSION_BASELINE: ScenarioResult = {
  label: "Do nothing",
  cycle_time_days: 3.34,
  bottleneck_stage: "Regional Transport",
  total_headcount: 22,
  incremental_cost: 0,
  per_stage: [
    { name: "Order Intake", headcount: 5, utilization: 0.25, wait_time_days: 0.0083, service_time_days: 0.125, is_bottleneck: false },
    { name: "Warehouse Pick and Pack", headcount: 8, utilization: 0.3906, wait_time_days: 0.025, service_time_days: 0.3125, is_bottleneck: false },
    { name: "Regional Transport", headcount: 3, utilization: 0.96, wait_time_days: 2.3014, service_time_days: 0.288, is_bottleneck: true },
    { name: "Last-Mile Delivery", headcount: 6, utilization: 0.4167, wait_time_days: 0.0298, service_time_days: 0.25, is_bottleneck: false },
  ],
};

export const EXPANSION_STRATEGIES: ScenarioResult[] = [
  EXPANSION_BASELINE,
  {
    ...EXPANSION_BASELINE,
    label: "Hire into Regional Transport",
    cycle_time_days: 1.22,
    total_headcount: 23,
    incremental_cost: 900_000,
    per_stage: EXPANSION_BASELINE.per_stage.map((s) =>
      s.name === "Regional Transport" ? { ...s, headcount: 4, utilization: 0.72, wait_time_days: 0.1851 } : s
    ),
  },
  {
    ...EXPANSION_BASELINE,
    label: "Move 1: Order Intake -> Regional Transport",
    cycle_time_days: 1.23,
    total_headcount: 22,
    incremental_cost: 0,
    per_stage: EXPANSION_BASELINE.per_stage.map((s) =>
      s.name === "Regional Transport"
        ? { ...s, headcount: 4, utilization: 0.72, wait_time_days: 0.1851 }
        : s.name === "Order Intake"
        ? { ...s, headcount: 4, utilization: 0.3125, wait_time_days: 0.0142 }
        : s
    ),
  },
];

export const DEMO: Record<ScenarioName, { baseline: ScenarioResult; strategies: ScenarioResult[]; title: string; blurb: string }> = {
  software: {
    baseline: SOFTWARE_BASELINE,
    strategies: SOFTWARE_STRATEGIES,
    title: "Software team",
    blurb: "Six stages, eight new items a day. Review is flat out at 96% — and half the entire cycle is spent waiting there.",
  },
  expansion: {
    baseline: EXPANSION_BASELINE,
    strategies: EXPANSION_STRATEGIES,
    title: "National expansion",
    blurb: "A Delhi operation shipping nationally. Everything routes through one regional hub, and that hub is the constraint.",
  },
};
