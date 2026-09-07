"use client";

import { ScenarioResult } from "@/lib/types";
import { pct, shortStage } from "@/lib/format";

interface Props {
  result: ScenarioResult;
  title?: string;
  /** "live" = numbers came from the running engine, "static" = verified snapshot */
  source?: "live" | "static" | "computing";
  editable?: boolean;
  onHeadcount?: (stage: string, headcount: number) => void;
  compact?: boolean;
  className?: string;
}

function barColor(u: number, isBottleneck: boolean) {
  if (isBottleneck) return "var(--accent)";
  if (u >= 0.8) return "var(--amber)";
  return "var(--ink)";
}

/**
 * The product's signature visual: one column per stage, bar height =
 * utilization, the bottleneck in accent. Used on the landing hero, the
 * scenario cards, and as the editable Decision Twin inside the app.
 */
export default function PipelineCard({
  result,
  title = "Decision twin",
  source = "static",
  editable = false,
  onHeadcount,
  compact = false,
  className = "",
}: Props) {
  const trackH = compact ? 96 : 150;

  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className={`flex items-center justify-between ${compact ? "px-5 pt-4" : "px-6 pt-5"}`}>
        <div className="eyebrow text-ink">{title}</div>
        <SourceChip source={source} />
      </div>

      <div className={`${compact ? "px-5 pt-4" : "px-6 pt-6"}`}>
        <div className="flex items-end gap-2 sm:gap-3">
          {result.per_stage.map((s) => {
            const u = Math.min(s.utilization, 1);
            const h = Math.max(4, u * trackH);
            return (
              <div key={s.name} className="flex-1 min-w-0 flex flex-col items-center">
                <div
                  className={`numeral font-semibold ${compact ? "text-[11px]" : "text-xs"} ${
                    s.is_bottleneck ? "text-accent" : "text-ink-2"
                  }`}
                >
                  {pct(s.utilization)}
                </div>
                <div
                  className="relative w-full rounded-[10px] bg-[rgba(10,10,10,0.05)] mt-1.5 overflow-hidden"
                  style={{ height: trackH }}
                  aria-label={`${s.name} ${pct(s.utilization)} utilized`}
                >
                  {/* 90% cliff line */}
                  <div
                    className="absolute left-0 right-0 border-t border-dashed border-[rgba(10,10,10,0.18)]"
                    style={{ bottom: 0.9 * trackH }}
                  />
                  <div
                    className="bar absolute bottom-0 left-0 right-0 rounded-[10px]"
                    style={{ height: h, background: barColor(u, s.is_bottleneck) }}
                  />
                </div>
                <div
                  className={`mt-2 font-semibold truncate max-w-full ${compact ? "text-[11px]" : "text-[12px] sm:text-[13px]"} ${
                    s.is_bottleneck ? "text-accent" : "text-ink"
                  }`}
                  title={s.name}
                >
                  {shortStage(s.name, compact ? 9 : 11)}
                </div>

                {editable ? (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <button
                      className="step"
                      aria-label={`Remove one from ${s.name}`}
                      disabled={s.headcount <= 1}
                      onClick={() => onHeadcount?.(s.name, s.headcount - 1)}
                    >
                      −
                    </button>
                    <span className="numeral text-sm font-semibold w-5 text-center">{s.headcount}</span>
                    <button
                      className="step"
                      aria-label={`Add one to ${s.name}`}
                      onClick={() => onHeadcount?.(s.name, s.headcount + 1)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div className={`text-muted ${compact ? "text-[10px]" : "text-[11px]"} mt-0.5`}>
                    {s.headcount} {s.headcount === 1 ? "person" : "people"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`mt-5 border-t border-line flex items-end justify-between gap-4 ${
          compact ? "px-5 py-4" : "px-6 py-5"
        }`}
      >
        <div>
          <div className="eyebrow">Cycle time</div>
          <div className={`numeral font-bold leading-none mt-1 ${compact ? "text-2xl" : "text-4xl"}`}>
            {result.cycle_time_days.toFixed(2)}
            <span className={`font-medium text-muted ${compact ? "text-sm" : "text-lg"} ml-1.5`}>days</span>
          </div>
        </div>
        <div className="text-right">
          <div className="eyebrow">Bottleneck</div>
          <div className={`font-semibold mt-1 text-accent ${compact ? "text-sm" : "text-lg"}`}>
            {result.bottleneck_stage}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SourceChip({ source }: { source: "live" | "static" | "computing" }) {
  if (source === "live")
    return (
      <span className="chip !py-1 !px-2.5 !text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-good animate-pulse2" />
        Live from engine
      </span>
    );
  if (source === "computing")
    return (
      <span className="chip !py-1 !px-2.5 !text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse2" />
        Computing…
      </span>
    );
  return (
    <span className="chip !py-1 !px-2.5 !text-[11px]">
      <span className="w-1.5 h-1.5 rounded-full bg-ink/40" />
      Engine snapshot
    </span>
  );
}
