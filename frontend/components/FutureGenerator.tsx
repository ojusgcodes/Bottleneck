"use client";

import { ScenarioResult } from "@/lib/types";

interface Props {
  strategies: ScenarioResult[];
  loading: boolean;
}

const currency = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export default function FutureGenerator({ strategies, loading }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-xs font-mono font-bold tracking-widest text-bcoral uppercase mb-1">
        2 · Future Generator
      </div>
      <h2 className="text-xl font-bold text-bprimary mb-1">Options, Not One Answer</h2>
      <p className="text-sm text-gray-500 mb-4">
        Every strategy below is a real run of the same engine — nothing here is guessed.
      </p>

      {loading && <div className="text-sm text-gray-400">Simulating strategies…</div>}

      <div className="grid sm:grid-cols-2 gap-3">
        {strategies.map((s) => {
          const isBaseline = s.label === "Do nothing";
          return (
            <div
              key={s.label}
              className={`rounded-lg border p-4 ${
                isBaseline ? "border-gray-200 bg-gray-50" : "border-bsuccess bg-green-50"
              }`}
            >
              <div className="text-sm font-semibold text-gray-700 mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-bprimary">{s.cycle_time_days} days</div>
              <div className="text-xs text-gray-500 mt-1">
                {s.incremental_cost > 0
                  ? `Cost: ₹${currency.format(s.incremental_cost)}`
                  : "Cost: ₹0"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
