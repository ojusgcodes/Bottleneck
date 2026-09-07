"use client";

import { ScenarioResult } from "@/lib/types";
import { inrShort, pct } from "@/lib/format";

interface Props {
  strategies: ScenarioResult[];
  loading: boolean;
}

export default function FutureGenerator({ strategies, loading }: Props) {
  const baseline = strategies.find((s) => s.label === "Do nothing") ?? strategies[0];
  const hire = strategies.find((s) => s.label.startsWith("Hire into"));
  const move = strategies.find((s) => s.label.startsWith("Move 1"));
  const hireGain = baseline && hire ? baseline.cycle_time_days - hire.cycle_time_days : 0;

  return (
    <section className="card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="eyebrow text-ink">02 · Future generator</div>
          <h2 className="mt-2 text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] leading-tight">
            Options, <span className="serif-em">not one answer.</span>
          </h2>
        </div>
        <p className="text-[14px] text-ink-2 max-w-[40ch] sm:text-right">
          Every card is a real run of the same engine. Nothing here is guessed.
        </p>
      </div>

      <div className={`mt-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-3 transition-opacity ${loading ? "opacity-50" : ""}`}>
        {strategies.map((s) => {
          const isBaseline = s === baseline;
          const isFree = !isBaseline && s.incremental_cost === 0;
          const delta = baseline ? s.cycle_time_days - baseline.cycle_time_days : 0;
          const share = isFree && hireGain > 0 ? Math.round(((baseline!.cycle_time_days - s.cycle_time_days) / hireGain) * 100) : null;
          const bn = s.per_stage.find((p) => p.is_bottleneck);

          return (
            <div
              key={s.label}
              className={`relative rounded-2xl border p-5 flex flex-col ${
                isFree ? "border-good/40 bg-good/5" : isBaseline ? "border-line bg-bg-2" : "border-line bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] font-semibold leading-snug">{s.label.replace("->", "→")}</div>
                {isFree && (
                  <span className="shrink-0 rounded-full bg-good text-white text-[10px] font-mono px-2 py-0.5">FREE</span>
                )}
              </div>

              <div className="numeral text-[40px] font-bold leading-none mt-4">
                {s.cycle_time_days.toFixed(2)}
                <span className="text-sm font-medium text-muted ml-1.5 tracking-normal">days</span>
              </div>

              <div className="mt-2 text-[13px]">
                {isBaseline ? (
                  <span className="text-muted">today&apos;s cycle time</span>
                ) : (
                  <span className={delta < 0 ? "text-good font-semibold" : "text-accent font-semibold"}>
                    {delta > 0 ? "+" : ""}
                    {delta.toFixed(2)} days
                  </span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-line text-[12px] text-ink-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Cost</span>
                  <span className="font-semibold">{s.incremental_cost > 0 ? `${inrShort(s.incremental_cost)} / yr` : "₹0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Bottleneck</span>
                  <span className="font-semibold truncate ml-3">{bn ? `${bn.name} · ${pct(bn.utilization)}` : "—"}</span>
                </div>
                {share !== null && (
                  <div className="flex justify-between text-good">
                    <span>of hiring&apos;s benefit</span>
                    <span className="font-semibold">{share}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {strategies.length === 0 && (
          <div className="col-span-full text-[14px] text-muted">Waiting for the engine…</div>
        )}
      </div>

      {move && hire && baseline && (
        <p className="mt-5 text-[14px] text-ink-2">
          Moving one person gets you{" "}
          <strong className="text-ink">{Math.round(((baseline.cycle_time_days - move.cycle_time_days) / hireGain) * 100)}%</strong> of
          what the hire buys, for nothing. The real question becomes: is the remaining{" "}
          <strong className="text-ink">{(move.cycle_time_days - hire.cycle_time_days).toFixed(2)} days</strong> worth{" "}
          <strong className="text-ink">{inrShort(hire.incremental_cost)} a year</strong>?
        </p>
      )}
    </section>
  );
}
