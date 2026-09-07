"use client";

import { useState } from "react";
import { CompanyConfig, RippleResult } from "@/lib/types";
import { getRipple } from "@/lib/api";

interface Props {
  config: CompanyConfig;
}

export default function DecisionRipple({ config }: Props) {
  const bottleneckGuess = config.stages[0]?.name ?? "";
  const [stageName, setStageName] = useState(bottleneckGuess);
  const [headcount, setHeadcount] = useState(
    config.stages.find((s) => s.name === bottleneckGuess)?.headcount ?? 1
  );
  const [result, setResult] = useState<RippleResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runRipple(name: string, hc: number) {
    setLoading(true);
    try {
      const r = await getRipple(config, name, Math.max(1, hc));
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  function onStageChange(name: string) {
    setStageName(name);
    const hc = config.stages.find((s) => s.name === name)?.headcount ?? 1;
    setHeadcount(hc);
    runRipple(name, hc);
  }

  function onSlide(value: number) {
    setHeadcount(value);
    runRipple(stageName, value);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-xs font-mono font-bold tracking-widest text-bcoral uppercase mb-1">
        3 · Decision Ripple
      </div>
      <h2 className="text-xl font-bold text-bprimary mb-1">Change One Thing. Watch It Cascade.</h2>
      <p className="text-sm text-gray-500 mb-4">
        Move the slider — the consequence chain updates live, calculated fresh every time.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={stageName}
          onChange={(e) => onStageChange(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          {config.stages.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="range"
          min={1}
          max={15}
          value={headcount}
          onChange={(e) => onSlide(parseInt(e.target.value, 10))}
          className="flex-1 min-w-[140px]"
        />
        <span className="text-sm font-semibold text-bprimary w-20">{headcount} people</span>
      </div>

      {loading && <div className="text-sm text-gray-400">Recalculating…</div>}

      {result && !loading && (
        <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded px-4 py-3">
          <div>
            <div className="text-xs text-gray-500">Before</div>
            <div className="text-xl font-bold text-gray-700">{result.before.cycle_time_days}d</div>
          </div>
          <div className="text-2xl text-gray-300">→</div>
          <div>
            <div className="text-xs text-gray-500">After</div>
            <div className="text-xl font-bold text-bprimary">{result.after.cycle_time_days}d</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-gray-500">Change</div>
            <div
              className={`text-xl font-bold ${
                result.delta_cycle_time_days < 0 ? "text-bsuccess" : "text-bcoral"
              }`}
            >
              {result.delta_cycle_time_days > 0 ? "+" : ""}
              {result.delta_cycle_time_days}d
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
