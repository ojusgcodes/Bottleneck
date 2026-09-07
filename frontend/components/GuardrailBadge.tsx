"use client";

import { ExplainResult } from "@/lib/types";

interface Props {
  result: ExplainResult | null;
  loading: boolean;
}

export default function GuardrailBadge({ result, loading }: Props) {
  return (
    <section className="card-dark relative overflow-hidden p-6 sm:p-8">
      <div className="absolute -top-32 right-0 h-[320px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
        <div className="md:w-[260px] shrink-0">
          <div className="eyebrow">Anti-fabrication guardrail</div>
          <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] leading-tight">
            Prose from the model. <span className="serif-em text-white/80">Numbers from the engine.</span>
          </h2>
          <p className="mt-2 text-[13px] text-white/50">
            Any figure the model writes that isn&apos;t in the engine result is deleted before it gets here.
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow">Explanation</span>
            {result && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono ${
                  result.numbers_verified ? "bg-good/20 text-[#7be0b0]" : "bg-amber/20 text-[#ffd48a]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${result.numbers_verified ? "bg-[#7be0b0]" : "bg-[#ffd48a]"}`} />
                {result.numbers_verified ? "0 fabricated" : `${result.numbers_removed.length} removed`}
              </span>
            )}
          </div>

          {loading && !result && (
            <div className="mt-3 flex items-center gap-2 text-[14px] text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse2" /> Generating explanation…
            </div>
          )}

          {result && (
            <>
              <p className={`mt-3 font-serif italic text-[20px] sm:text-[22px] leading-snug text-white/90 transition-opacity ${loading ? "opacity-50" : ""}`}>
                &ldquo;{result.explanation}&rdquo;
              </p>
              {result.numbers_removed.length > 0 && (
                <p className="mt-3 text-[12px] text-[#ffd48a] font-mono">
                  stripped before display: {result.numbers_removed.join(", ")}
                </p>
              )}
              <p className="mt-3 text-[11px] text-white/40 font-mono">
                source · {result.source === "llm" ? "language model, guardrail-checked" : "offline template built from engine output"}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
