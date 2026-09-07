"use client";

import { useEffect, useRef, useState } from "react";
import { CompanyConfig, RippleResult, ScenarioResult } from "@/lib/types";
import { getRipple } from "@/lib/api";
import { pct, shortStage } from "@/lib/format";

interface Props {
  config: CompanyConfig;
  baseline: ScenarioResult | null;
}

const MAX = 15;

export default function DecisionRipple({ config, baseline }: Props) {
  const defaultStage = baseline?.bottleneck_stage ?? config.stages[0]?.name ?? "";
  const [stageName, setStageName] = useState(defaultStage);
  const [headcount, setHeadcount] = useState(config.stages.find((s) => s.name === defaultStage)?.headcount ?? 1);
  const [result, setResult] = useState<RippleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const ctrl = useRef<AbortController | null>(null);
  const timer = useRef<number | null>(null);
  const picked = useRef<string | null>(null);

  // Follow the bottleneck until the user picks a stage; re-anchor whenever the
  // config changes elsewhere (scenario switch, headcount edit).
  useEffect(() => {
    const keep = picked.current && config.stages.some((s) => s.name === picked.current);
    const name = keep ? (picked.current as string) : defaultStage;
    const hc = config.stages.find((s) => s.name === name)?.headcount ?? 1;
    setStageName(name);
    setHeadcount(hc);
    run(name, hc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, defaultStage]);

  function run(name: string, hc: number) {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setLoading(true);
      try {
        const r = await getRipple(config, name, Math.max(1, hc), c.signal);
        if (!c.signal.aborted) setResult(r);
      } catch {
        /* aborted or offline */
      } finally {
        if (ctrl.current === c) setLoading(false);
      }
    }, 90);
  }

  function pick(name: string) {
    picked.current = name;
    const hc = config.stages.find((s) => s.name === name)?.headcount ?? 1;
    setStageName(name);
    setHeadcount(hc);
    run(name, hc);
  }

  function slide(v: number) {
    setHeadcount(v);
    run(stageName, v);
  }

  const original = config.stages.find((s) => s.name === stageName)?.headcount ?? 1;
  const fill = ((headcount - 1) / (MAX - 1)) * 100;
  const delta = result?.delta_cycle_time_days ?? 0;

  return (
    <section className="card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="eyebrow text-ink">03 · Decision ripple</div>
          <h2 className="mt-2 text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] leading-tight">
            Move the slider. <span className="serif-em">Watch the chain recompute.</span>
          </h2>
        </div>
        <p className="text-[14px] text-ink-2 max-w-[40ch] sm:text-right">
          Nothing is cached — every position is a fresh calculation.
        </p>
      </div>

      <div className="mt-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap gap-2">
            {config.stages.map((s) => (
              <button
                key={s.name}
                onClick={() => pick(s.name)}
                className={`h-9 px-3.5 rounded-full text-[13px] font-semibold border transition-colors ${
                  s.name === stageName
                    ? "bg-ink text-white border-ink"
                    : "bg-white text-ink-2 border-line-strong hover:bg-bg-2"
                }`}
              >
                {s.name}
                {baseline?.bottleneck_stage === s.name && (
                  <span className={`ml-1.5 ${s.name === stageName ? "text-accent" : "text-accent"}`}>●</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-5">
            <div className="flex-1">
              <input
                type="range"
                className="range"
                min={1}
                max={MAX}
                step={1}
                value={headcount}
                style={{ ["--fill" as any]: `${fill}%` }}
                onChange={(e) => slide(parseInt(e.target.value, 10))}
                aria-label={`${stageName} headcount`}
              />
              <div className="mt-2 flex justify-between text-[11px] font-mono text-muted">
                <span>1</span>
                <span>
                  seed: {original}
                </span>
                <span>{MAX}</span>
              </div>
            </div>
            <div className="text-right w-[92px] shrink-0">
              <div className="numeral text-[36px] font-bold leading-none">{headcount}</div>
              <div className="text-[12px] text-muted">people in {shortStage(stageName, 10)}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className={`rounded-2xl bg-bg-2 border border-line p-5 transition-opacity ${loading ? "opacity-60" : ""}`}>
            <div className="grid grid-cols-3 items-end">
              <div>
                <div className="eyebrow">Before</div>
                <div className="numeral text-[30px] font-bold leading-none mt-1 text-ink-2">
                  {result ? result.before.cycle_time_days.toFixed(2) : "—"}
                </div>
              </div>
              <div className="text-center text-muted text-2xl pb-1" aria-hidden>
                →
              </div>
              <div className="text-right">
                <div className="eyebrow">After</div>
                <div className="numeral text-[30px] font-bold leading-none mt-1">
                  {result ? result.after.cycle_time_days.toFixed(2) : "—"}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
              <span className="text-[13px] text-muted">Change in cycle time</span>
              <span className={`numeral text-lg font-bold ${delta < 0 ? "text-good" : delta > 0 ? "text-accent" : "text-ink-2"}`}>
                {delta > 0 ? "+" : ""}
                {result ? delta.toFixed(2) : "—"} days
              </span>
            </div>
          </div>

          {result && (
            <ul className="mt-3 space-y-1.5">
              {result.after.per_stage.map((a) => {
                const b = result.before.per_stage.find((x) => x.name === a.name);
                const changed = b && Math.abs(b.utilization - a.utilization) > 0.0005;
                return (
                  <li key={a.name} className="flex items-center justify-between text-[13px] px-1">
                    <span className={`font-medium ${a.is_bottleneck ? "text-accent" : "text-ink-2"}`}>
                      {a.name}
                      {a.is_bottleneck && <span className="ml-1.5 text-[10px] font-mono uppercase">bottleneck</span>}
                    </span>
                    <span className="numeral font-mono text-[12px]">
                      {b && changed ? (
                        <>
                          <span className="text-muted">{pct(b.utilization)}</span>
                          <span className="text-muted mx-1.5">→</span>
                          <span className="font-semibold text-ink">{pct(a.utilization)}</span>
                        </>
                      ) : (
                        <span className="text-muted">{pct(a.utilization)}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
