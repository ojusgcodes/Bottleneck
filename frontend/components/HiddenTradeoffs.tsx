"use client";

import { TradeoffFinding } from "@/lib/types";

interface Props {
  findings: TradeoffFinding[];
  loading: boolean;
}

function tone(type: string): { dot: string; label: string } {
  const t = type.toLowerCase();
  if (t.includes("mislocat")) return { dot: "bg-accent", label: "mislocated focus" };
  if (t.includes("dimin")) return { dot: "bg-amber", label: "diminishing returns" };
  if (t.includes("slack") || t.includes("under")) return { dot: "bg-good", label: "slack" };
  return { dot: "bg-ink/40", label: type.replace(/_/g, " ") };
}

export default function HiddenTradeoffs({ findings, loading }: Props) {
  return (
    <section className="card p-6 sm:p-8 flex flex-col">
      <div className="eyebrow text-ink">04 · Hidden trade-offs</div>
      <h2 className="mt-2 text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] leading-tight">
        What you <span className="serif-em">didn&apos;t ask about.</span>
      </h2>
      <p className="mt-2 text-[14px] text-ink-2">
        The engine compares every stage automatically and flags what stands out.
      </p>

      <div className={`mt-5 space-y-2 transition-opacity ${loading ? "opacity-50" : ""}`}>
        {findings.map((f, i) => {
          const t = tone(f.type);
          return (
            <div key={i} className="flex gap-3 rounded-2xl bg-bg-2 border border-line px-4 py-3.5">
              <span className={`mt-[7px] w-2 h-2 rounded-full shrink-0 ${t.dot}`} />
              <div className="min-w-0">
                <div className="eyebrow !text-[10px] mb-1">
                  {t.label} · {f.stage}
                </div>
                <p className="text-[14px] leading-relaxed text-ink">{f.message}</p>
              </div>
            </div>
          );
        })}
        {!loading && findings.length === 0 && (
          <div className="rounded-2xl bg-bg-2 border border-line px-4 py-3.5 text-[14px] text-muted">
            No hidden trade-offs in this configuration.
          </div>
        )}
      </div>
    </section>
  );
}
