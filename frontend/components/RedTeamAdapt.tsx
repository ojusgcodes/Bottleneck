"use client";

import { useState } from "react";
import { CompanyConfig, AdaptResult } from "@/lib/types";
import { getAdapt } from "@/lib/api";

interface Props {
  config: CompanyConfig;
}

export default function RedTeamAdapt({ config }: Props) {
  const [result, setResult] = useState<AdaptResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const r = await getAdapt(config, 1.3, 0.85);
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-xs font-mono font-bold tracking-widest text-bcoral uppercase mb-1">
        5 · Red Team + Adapt
      </div>
      <h2 className="text-xl font-bold text-bprimary mb-1">Attack Your Own Plan</h2>
      <p className="text-sm text-gray-500 mb-4">
        Demand +30%, headcount −15%. Does the plan survive?
      </p>

      <button
        onClick={run}
        disabled={loading}
        className="bg-bcoral text-white text-sm font-semibold rounded px-4 py-2 mb-4 disabled:opacity-50"
      >
        {loading ? "Attacking plan…" : "Red team this plan"}
      </button>

      {result && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="border border-bcoral bg-red-50 rounded-lg p-4">
            <div className="text-sm font-bold text-bcoral mb-2">ORIGINAL PLAN</div>
            <div className="text-xs text-gray-500">Normal</div>
            <div className="text-lg font-bold text-gray-700">
              {result.original_normal.cycle_time_days}d · score {result.original_normal_score}
            </div>
            <div className="text-xs text-gray-500 mt-2">Under stress</div>
            <div className="text-lg font-bold text-bcoral">
              {result.original_stress.cycle_time_days}d · score {result.original_stress_score}
            </div>
          </div>

          <div className="border border-bsuccess bg-green-50 rounded-lg p-4">
            <div className="text-sm font-bold text-bsuccess mb-2">ADAPTED PLAN</div>
            <div className="text-xs text-gray-500">Normal</div>
            <div className="text-lg font-bold text-gray-700">
              {result.adapted_normal.cycle_time_days}d · score {result.adapted_normal_score}
            </div>
            <div className="text-xs text-gray-500 mt-2">Under stress</div>
            <div className="text-lg font-bold text-bsuccess">
              {result.adapted_stress.cycle_time_days}d · score {result.adapted_stress_score}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
