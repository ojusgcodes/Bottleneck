"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CompanyConfig,
  ExplainResult,
  ScenarioName,
  ScenarioResult,
  TradeoffFinding,
} from "@/lib/types";
import { BASE_URL, explain, getSeed, getStrategies, getTradeoffs, simulate } from "@/lib/api";
import AppNav from "@/components/AppNav";
import DecisionTwinForm from "@/components/DecisionTwinForm";
import GuardrailBadge from "@/components/GuardrailBadge";
import FutureGenerator from "@/components/FutureGenerator";
import DecisionRipple from "@/components/DecisionRipple";
import HiddenTradeoffs from "@/components/HiddenTradeoffs";
import RedTeamAdapt from "@/components/RedTeamAdapt";

export default function AppPage() {
  return (
    <Suspense fallback={null}>
      <Simulator />
    </Suspense>
  );
}

function Simulator() {
  const params = useSearchParams();
  const initial = (params.get("scenario") === "expansion" ? "expansion" : "software") as ScenarioName;

  const [scenario, setScenario] = useState<ScenarioName>(initial);
  const [seed, setSeed] = useState<CompanyConfig | null>(null);
  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [baseline, setBaseline] = useState<ScenarioResult | null>(null);
  const [strategies, setStrategies] = useState<ScenarioResult[]>([]);
  const [tradeoffs, setTradeoffs] = useState<TradeoffFinding[]>([]);
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null);
  const [computing, setComputing] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const recompute = useCallback(async (cfg: CompanyConfig) => {
    const id = ++runId.current;
    setComputing(true);
    setError(null);
    try {
      const [sim, strat, trade] = await Promise.all([simulate(cfg), getStrategies(cfg), getTradeoffs(cfg)]);
      if (id !== runId.current) return;
      setBaseline(sim);
      setStrategies(strat);
      setTradeoffs(trade);
      setComputing(false);

      setExplaining(true);
      const exp = await explain(sim);
      if (id !== runId.current) return;
      setExplainResult(exp);
    } catch (e: any) {
      if (id !== runId.current) return;
      setError(`Could not reach the engine at ${BASE_URL}. Is uvicorn running? (${e.message})`);
    } finally {
      if (id === runId.current) {
        setComputing(false);
        setExplaining(false);
      }
    }
  }, []);

  // Load (or switch) scenario
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const s = await getSeed(scenario);
        if (cancelled) return;
        setSeed(s);
        setConfig(s);
        setExplainResult(null);
        await recompute(s);
      } catch (e: any) {
        if (cancelled) return;
        setError(
          `Could not reach the engine at ${BASE_URL}. Start it with: uvicorn app.main:app --reload --port 8000 (${e.message})`
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scenario, recompute]);

  function onConfigChange(next: CompanyConfig) {
    setConfig(next);
    recompute(next);
  }

  function reset() {
    if (seed) onConfigChange(seed);
  }

  const dirty = !!seed && !!config && JSON.stringify(seed) !== JSON.stringify(config);

  return (
    <main className="min-h-screen pb-24">
      <AppNav scenario={scenario} onScenario={setScenario} connected={!error && !!baseline} />

      <div className="mx-auto max-w-wrap px-5 pt-28 sm:pt-32">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="eyebrow">Decision simulator · {scenario === "software" ? "Software team" : "National expansion"}</div>
            <h1 className="display mt-3 text-[40px] sm:text-[56px]">
              Change one thing. <em>Watch it cascade.</em>
            </h1>
          </div>
          <p className="text-[15px] text-ink-2 max-w-[44ch] md:text-right">
            Every figure below is a fresh run of the engine. Edit a headcount and the whole page recomputes.
          </p>
        </header>

        {error && (
          <div className="mt-8 rounded-2xl border border-accent/40 bg-accent/5 px-5 py-4 text-[14px] text-ink">
            <span className="font-semibold text-accent">Engine offline.</span> {error}
          </div>
        )}

        {config && (
          <div className="mt-10 space-y-5">
            <DecisionTwinForm
              config={config}
              baseline={baseline}
              computing={computing}
              dirty={dirty}
              onChange={onConfigChange}
              onReset={reset}
            />

            <GuardrailBadge result={explainResult} loading={explaining || (computing && !explainResult)} />

            <FutureGenerator strategies={strategies} loading={computing} />

            <DecisionRipple config={config} baseline={baseline} />

            <div className="grid lg:grid-cols-2 gap-5">
              <HiddenTradeoffs findings={tradeoffs} loading={computing} />
              <RedTeamAdapt config={config} />
            </div>
          </div>
        )}

        {!config && !error && (
          <div className="mt-20 flex items-center justify-center gap-3 text-muted">
            <span className="w-2 h-2 rounded-full bg-amber animate-pulse2" /> Loading seed company…
          </div>
        )}
      </div>
    </main>
  );
}
