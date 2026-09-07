"use client";

import { useEffect, useState, useCallback } from "react";
import { CompanyConfig, ScenarioResult, TradeoffFinding, ExplainResult } from "@/lib/types";
import { getSeed, getAvailableScenarios, simulate, getStrategies, getTradeoffs, explain } from "@/lib/api";
import DecisionTwinForm from "@/components/DecisionTwinForm";
import FutureGenerator from "@/components/FutureGenerator";
import DecisionRipple from "@/components/DecisionRipple";
import HiddenTradeoffs from "@/components/HiddenTradeoffs";
import RedTeamAdapt from "@/components/RedTeamAdapt";
import GuardrailBadge from "@/components/GuardrailBadge";

export default function Home() {
  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [baseline, setBaseline] = useState<ScenarioResult | null>(null);
  const [strategies, setStrategies] = useState<ScenarioResult[]>([]);
  const [tradeoffs, setTradeoffs] = useState<TradeoffFinding[]>([]);
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<string[]>(["software"]);
  const [activeScenario, setActiveScenario] = useState("software");
  const [switching, setSwitching] = useState(false);

  const recompute = useCallback(async (cfg: CompanyConfig) => {
    setLoading(true);
    setError(null);
    try {
      const [sim, strat, trade] = await Promise.all([
        simulate(cfg),
        getStrategies(cfg),
        getTradeoffs(cfg),
      ]);
      setBaseline(sim);
      setStrategies(strat);
      setTradeoffs(trade);
      const exp = await explain(sim);
      setExplainResult(exp);
    } catch (e: any) {
      setError(
        `Could not reach the backend at ${
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
        }. Is uvicorn running? (${e.message})`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [names, seed] = await Promise.all([getAvailableScenarios(), getSeed("software")]);
        setScenarios(names);
        setConfig(seed);
        await recompute(seed);
      } catch (e: any) {
        setError(
          `Could not reach the backend at ${
            process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
          }. Start it with: uvicorn app.main:app --reload (${e.message})`
        );
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onConfigChange(next: CompanyConfig) {
    setConfig(next);
    recompute(next);
  }

  async function onScenarioSwitch(name: string) {
    setSwitching(true);
    setActiveScenario(name);
    try {
      const seed = await getSeed(name);
      setConfig(seed);
      await recompute(seed);
    } catch (e: any) {
      setError(`Could not load scenario "${name}": ${e.message}`);
    } finally {
      setSwitching(false);
    }
  }

  const scenarioLabels: Record<string, string> = {
    software: "Software Team",
    expansion: "Business Expansion (Delhi → UP)",
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-bdark text-white px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-mono font-bold tracking-widest text-bcoral uppercase mb-2">
            Decision Simulator
          </div>
          <h1 className="text-3xl font-bold">Bottleneck</h1>
          <p className="text-gray-300 mt-1">Experiment with the decision before you deploy resources.</p>

          <div className="flex gap-2 mt-4">
            {scenarios.map((name) => (
              <button
                key={name}
                onClick={() => onScenarioSwitch(name)}
                disabled={switching}
                className={`text-xs font-semibold px-3 py-2 rounded transition ${
                  activeScenario === name
                    ? "bg-bcoral text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                } disabled:opacity-50`}
              >
                {scenarioLabels[name] || name}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Same engine, different domain — proof this isn't a hiring calculator.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-bcoral text-bcoral rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {config && (
          <>
            <DecisionTwinForm
              config={config}
              onChange={onConfigChange}
              baselineDays={baseline?.cycle_time_days}
              bottleneckStage={baseline?.bottleneck_stage}
            />

            <GuardrailBadge result={explainResult} loading={loading} />

            <FutureGenerator strategies={strategies} loading={loading} />

            <DecisionRipple config={config} />

            <HiddenTradeoffs findings={tradeoffs} loading={loading} />

            <RedTeamAdapt config={config} />
          </>
        )}

        {!config && !error && (
          <div className="text-center text-gray-400 py-20">Loading seed company…</div>
        )}
      </div>
    </main>
  );
}
