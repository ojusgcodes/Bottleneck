"use client";

import { CompanyConfig, ScenarioResult } from "@/lib/types";
import PipelineCard from "@/components/ui/PipelineCard";
import { inrShort, pct } from "@/lib/format";

interface Props {
  config: CompanyConfig;
  baseline: ScenarioResult | null;
  computing: boolean;
  dirty: boolean;
  onChange: (config: CompanyConfig) => void;
  onReset: () => void;
}

export default function DecisionTwinForm({ config, baseline, computing, dirty, onChange, onReset }: Props) {
  function updateHeadcount(stageName: string, headcount: number) {
    onChange({
      ...config,
      stages: config.stages.map((s) => (s.name === stageName ? { ...s, headcount: Math.max(1, headcount) } : s)),
    });
  }

  // Until the first result arrives, draw the pipeline from the config alone.
  const shown: ScenarioResult =
    baseline ?? {
      label: "Baseline",
      cycle_time_days: 0,
      bottleneck_stage: "—",
      total_headcount: config.stages.reduce((a, s) => a + s.headcount, 0),
      incremental_cost: 0,
      per_stage: config.stages.map((s) => ({
        name: s.name,
        headcount: s.headcount,
        utilization: 0,
        wait_time_days: 0,
        service_time_days: 0,
        is_bottleneck: false,
      })),
    };

  const bn = baseline?.per_stage.find((s) => s.is_bottleneck);
  const totalWait = baseline ? baseline.per_stage.reduce((a, s) => a + s.wait_time_days, 0) : 0;

  return (
    <section className="grid lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8">
        <PipelineCard
          result={shown}
          title="01 · Decision twin"
          source={computing ? "computing" : baseline ? "live" : "static"}
          editable
          onHeadcount={updateHeadcount}
        />
      </div>

      <aside className="lg:col-span-4 card p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="eyebrow text-ink">Your company, structured</div>
          {dirty && (
            <button onClick={onReset} className="text-[12px] font-semibold text-ink-2 hover:text-ink underline underline-offset-4">
              Reset to seed
            </button>
          )}
        </div>
        <p className="mt-2 text-[14px] text-ink-2">
          Use the − / + under each stage. Utilisation, waiting and cycle time recompute on every change.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
          <Stat label="Arrivals" value={`${config.arrival_rate}`} unit="/ day" />
          <Stat label="Headcount" value={`${shown.total_headcount}`} unit="people" />
          <Stat label="Cost per hire" value={inrShort(config.cost_per_head)} unit="/ year" />
          <Stat label="Days waiting" value={baseline ? totalWait.toFixed(2) : "—"} unit={baseline ? `of ${baseline.cycle_time_days}` : undefined} />
        </dl>

        {bn && (
          <div className="mt-auto pt-6">
            <div className="rounded-2xl bg-accent/5 border border-accent/30 px-4 py-3">
              <div className="eyebrow !text-accent">Bottleneck</div>
              <div className="mt-1 font-semibold text-[17px]">{bn.name}</div>
              <div className="text-[13px] text-ink-2 mt-0.5">
                {pct(bn.utilization, 1)} utilised · {bn.wait_time_days.toFixed(2)} days waiting per item
              </div>
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="numeral text-2xl font-bold mt-1 leading-none">
        {value}
        {unit && <span className="text-[12px] font-medium text-muted ml-1.5 tracking-normal">{unit}</span>}
      </dd>
    </div>
  );
}
