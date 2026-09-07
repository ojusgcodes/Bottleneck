"use client";

import { useEffect, useState } from "react";
import { getSeed, getStrategies, simulate } from "./api";
import { DEMO } from "./demo";
import { ScenarioName, ScenarioResult } from "./types";

export interface LiveDemo {
  baseline: ScenarioResult;
  strategies: ScenarioResult[];
  source: "live" | "static";
}

/**
 * Landing-page data: try the real engine (short timeout), otherwise fall
 * back to the verified snapshot in lib/demo.ts. Either way the page shows
 * engine output — never a hand-typed number.
 */
export function useLiveDemo(scenario: ScenarioName): LiveDemo {
  const [state, setState] = useState<LiveDemo>({
    baseline: DEMO[scenario].baseline,
    strategies: DEMO[scenario].strategies,
    source: "static",
  });

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);

    (async () => {
      try {
        const cfg = await getSeed(scenario, ctrl.signal);
        const [baseline, strategies] = await Promise.all([
          simulate(cfg, ctrl.signal),
          getStrategies(cfg, ctrl.signal),
        ]);
        if (!cancelled) setState({ baseline, strategies, source: "live" });
      } catch {
        /* backend not running — keep the snapshot */
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [scenario]);

  return state;
}
