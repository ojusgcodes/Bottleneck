import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Reveal from "@/components/ui/Reveal";

export default function Footer() {
  return (
    <>
      <section className="mx-auto max-w-wrap px-5 pt-10 pb-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] sm:rounded-[48px] bg-white border border-line px-6 sm:px-12 py-16 sm:py-24 text-center">
            <div className="absolute inset-0 -z-0 grid-dots [mask-image:radial-gradient(50%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-70" />
            <div className="relative">
              <div className="eyebrow">Ready when you are</div>
              <h2 className="display mt-5 text-[40px] sm:text-[64px] md:text-[80px] max-w-[16ch] mx-auto">
                Test the decision <em>before</em> you pay for it.
              </h2>
              <p className="lede mt-6 max-w-[48ch] mx-auto">
                Two demo companies are loaded. Move one person, watch the cycle time move, then try to break the
                plan.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/app" className="btn btn-primary">
                  Open the simulator <span aria-hidden>→</span>
                </Link>
                <Link href="/app?scenario=expansion" className="btn btn-ghost">
                  Try the logistics scenario
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="mx-auto max-w-wrap px-5 pb-10 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-line-strong pt-8">
          <div className="flex items-center gap-3">
            <Logo size={26} />
            <div>
              <div className="font-semibold tracking-[-0.02em]">Bottleneck</div>
              <div className="text-[12px] text-muted">Resonance 1.0 · PS 7 · Decision simulation &amp; scenario intelligence</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-2">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#cliff" className="hover:text-ink">The cliff</a>
            <a href="#guardrail" className="hover:text-ink">Guardrail</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
            <Link href="/app" className="hover:text-ink">Simulator</Link>
          </div>
        </div>
        <p className="mt-6 text-[12px] text-muted font-mono">
          every figure on this page traces back to backend/app/engine/queueing.py
        </p>
      </footer>
    </>
  );
}
