"use client";

import { useEffect, useState } from "react";
import { AdaptResult, CompanyConfig } from "@/lib/types";
import { getAdapt } from "@/lib/api";

interface Props {
  config: CompanyConfig;
}

const DEMAND = 1.3;
const RESOURCE = 0.85;

export default function RedTeamAdapt({ config }: Props) {
  const [result, setResult] = useState<AdaptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stale, setStale] = useState(false);

  // A result belongs to the config it was computed for.
  useEffect(() => {
    if (result) setStale(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  async function run() {
    setLoading(true);
    try {
      const r = await getAdapt(config, DEMAND, RESOURCE);
      setResult(r);
      setStale(false);
    } finally {
      setLoading(false);
    }
  }

  const changes = result
    ? result.adapted_normal.per_stage
        .map((a) => {
          const o = result.original_normal.per_stage.find((s) => s.name === a.name);
          return o && o.headcount !== a.headcount ? `${a.headcount - o.headcount > 0 ? "+" : ""}${a.headcount - o.headcount} in ${a.name}` : null;
        })
        .filter(Boolean)
    : [];

  return (
    <section className="card p-6 sm:p-8 flex flex-col">
      <div className="eyebrow text-ink">05 · Red team + adapt</div>
      <h2 className="mt-2 text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] leading-tight">
        Attack <span className="serif-em">your own plan.</span>
      </h2>
      <p className="mt-2 text-[14px] text-ink-2">
        Demand +{Math.round((DEMAND - 1) * 100)}%, headcount −{Math.round((1 - RESOURCE) * 100)}%. Does the plan survive? If not, the
        engine searches nearby plans for one that does.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={run} disabled={loading} className="btn btn-accent">
          {loading ? "Attacking plan…" : result ? "Run it again" : "Red-team this plan"}
          {!loading && <span aria-hidden>→</span>}
        </button>
        {stale && !loading && <span className="text-[12px] text-amber font-medium">Config changed — re-run to refresh.</span>}
      </div>

      {result && (
        <div className={`mt-6 grid sm:grid-cols-2 gap-3 transition-opacity ${stale ? "opacity-50" : ""}`}>
          <PlanCard
            title="Original plan"
            tone="accent"
            normal={result.original_normal.cycle_time_days}
            normalScore={result.original_normal_score}
            stress={result.original_stress.cycle_time_days}
            stressScore={result.original_stress_score}
          />
          <PlanCard
            title="Adapted plan"
            tone="good"
            normal={result.adapted_normal.cycle_time_days}
            normalScore={result.adapted_normal_score}
            stress={result.adapted_stress.cycle_time_days}
            stressScore={result.adapted_stress_score}
            note={changes.length ? changes.join(" · ") : "no change found that survives better"}
          />
        </div>
      )}

      {result && (
        <p className="mt-4 text-[12px] text-muted font-mono">
          score = target ÷ actual cycle time, capped at 100 · target is today&apos;s cycle time
        </p>
      )}
    </section>
  );
}

function PlanCard({
  title,
  tone,
  normal,
  normalScore,
  stress,
  stressScore,
  note,
}: {
  title: string;
  tone: "accent" | "good";
  normal: number;
  normalScore: number;
  stress: number;
  stressScore: number;
  note?: string;
}) {
  const c = tone === "good" ? "var(--good)" : "var(--accent)";
  return (
    <div className="rounded-2xl border border-line bg-bg-2 p-5">
      <div className="eyebrow" style={{ color: c }}>
        {title}
      </div>
      <Row label="Normal" days={normal} score={normalScore} color="var(--ink)" />
      <Row label="Under stress" days={stress} score={stressScore} color={c} />
      {note && <div className="mt-3 pt-3 border-t border-line text-[12px] text-ink-2">{note}</div>}
    </div>
  );
}

function Row({ label, days, score, color }: { label: string; days: number; score: number; color: string }) {
  return (
    <div className="mt-4">
      <div className="flex items-end justify-between">
        <span className="text-[12px] text-muted">{label}</span>
        <span className="numeral text-[22px] font-bold leading-none" style={{ color }}>
          {days.toFixed(2)}
          <span className="text-[11px] font-medium text-muted ml-1 tracking-normal">days</span>
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-[rgba(10,10,10,0.08)] overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(100, score)}%`, background: color }} />
      </div>
      <div className="mt-1 text-[11px] font-mono text-muted">score {score}</div>
    </div>
  );
}
