import Reveal from "@/components/ui/Reveal";

const FLOW = [
  { k: "Controls", d: "resources · constraints · priorities" },
  { k: "Engine", d: "pure Python · queueing maths · tested" },
  { k: "Results", d: "every figure the product will show" },
  { k: "Language model", d: "writes the explanation — prose only" },
  { k: "Guardrail", d: "deletes any figure not in Results", hot: true },
  { k: "Screen", d: "results are the only source" },
];

export default function Guardrail() {
  return (
    <section id="guardrail" className="mx-auto max-w-wrap px-5 py-10 scroll-mt-24">
      <Reveal>
        <div className="card-dark relative overflow-hidden rounded-[36px] sm:rounded-[48px] px-6 sm:px-12 lg:px-16 py-14 sm:py-20">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.10),transparent)] pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start relative">
            <div className="lg:col-span-5">
              <div className="eyebrow">The invariant</div>
              <h2 className="display-md mt-4 text-[38px] sm:text-[56px]">
                No number on screen was <em>written</em> by an AI.
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-white/70">
                A language model cannot simulate. It can only produce text that sounds like simulation. So the
                engine is the only thing in the system permitted to produce a number, the model writes sentences,
                and the guardrail deletes any figure in those sentences that doesn&apos;t appear in the
                engine&apos;s output.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-white/50">
                No API key? It falls back to a template built directly from the engine&apos;s numbers — a wifi
                drop never breaks the demo.
              </p>
            </div>

            <div className="lg:col-span-7">
              <ol className="grid sm:grid-cols-2 gap-3">
                {FLOW.map((f, i) => (
                  <li
                    key={f.k}
                    className={`rounded-2xl border px-5 py-4 ${
                      f.hot
                        ? "border-accent/60 bg-accent/10"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="eyebrow !text-white/40">{String(i + 1).padStart(2, "0")}</span>
                      {f.hot && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse2" />}
                    </div>
                    <div className={`mt-2 font-semibold text-[17px] ${f.hot ? "text-accent" : ""}`}>{f.k}</div>
                    <div className="mt-1 text-[13px] text-white/55">{f.d}</div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Sample output · guardrail-checked</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-good/20 text-[#7be0b0] px-2.5 py-1 text-[11px] font-mono">
                    0 fabricated
                  </span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-white/85 font-serif italic text-[18px]">
                  &ldquo;Review is the constraint at 95.7% utilisation, and it accounts for most of the 5.29-day
                  cycle. Moving one person from Design — which has slack at 50% — brings the cycle to 2.93 days,
                  nearly matching a new hire at 2.88 for no additional cost.&rdquo;
                </p>
                <p className="mt-3 text-[12px] text-white/40 font-mono">
                  every figure above appears verbatim in the engine result · anything else would have been stripped
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
