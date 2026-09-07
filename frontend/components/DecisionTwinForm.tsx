"use client";

import { CompanyConfig } from "@/lib/types";

interface Props {
  config: CompanyConfig;
  onChange: (config: CompanyConfig) => void;
  baselineDays?: number;
  bottleneckStage?: string;
}

export default function DecisionTwinForm({ config, onChange, baselineDays, bottleneckStage }: Props) {
  function updateHeadcount(stageName: string, headcount: number) {
    const next: CompanyConfig = {
      ...config,
      stages: config.stages.map((s) =>
        s.name === stageName ? { ...s, headcount: Math.max(1, headcount) } : s
      ),
    };
    onChange(next);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-xs font-mono font-bold tracking-widest text-bcoral uppercase mb-1">
        1 · Decision Twin
      </div>
      <h2 className="text-xl font-bold text-bprimary mb-1">Your Company, Structured</h2>
      <p className="text-sm text-gray-500 mb-4">
        Resources, constraints, objective — turned into a model the engine can simulate.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {config.stages.map((stage) => (
          <div key={stage.name} className="border border-gray-200 rounded p-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">{stage.name}</label>
            <input
              type="number"
              min={1}
              value={stage.headcount}
              onChange={(e) => updateHeadcount(stage.name, parseInt(e.target.value || "1", 10))}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <span className="text-[10px] text-gray-400">people</span>
          </div>
        ))}
      </div>

      {baselineDays !== undefined && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-4 py-3">
          <div>
            <div className="text-xs text-gray-500">Cycle time</div>
            <div className="text-2xl font-bold text-bprimary">{baselineDays} days</div>
          </div>
          {bottleneckStage && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Bottleneck</div>
              <div className="text-lg font-bold text-bcoral">{bottleneckStage}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
