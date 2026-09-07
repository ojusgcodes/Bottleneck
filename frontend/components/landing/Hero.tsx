"use client";

import Link from "next/link";
import PipelineCard from "@/components/ui/PipelineCard";
import { useLiveDemo } from "@/lib/useLiveDemo";
import { inrShort } from "@/lib/format";

export default function Hero() {
  const { baseline, strategies, source } = useLiveDemo("software");
  const hire = strategies.find((s) => s.label.startsWith("Hire into"));
  const move = strategies.find((s) => s.label.startsWith("Move 1"));
  const share =
    hire && move && baseline.cycle_time_days - hire.cycle_time_days > 0
      ? Math.round(((baseline.cycle_time_days - move.cycle_time_days) / (baseline.cycle_time_days - hire.cycle_time_days)) * 100)
      : null;

  return (
    <section className="relative pt-36 sm:pt-44 pb-10 overflow-hidden">
      {/* soft spotlight + dot grid, like the reference heroes */}
      <div className="absolute inset-0 -z-10 grid-dots [mask-image:radial-gradient(60%_50%_at_50%_30%,#000_30%,transparent_100%)]" />
      <div className="absolute -z-10 left-1/2 top-24 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.9),transparent)]" />

      <div className="mx-auto max-w-wrap px-5 text-center">
        <div className="reveal is-in inline-flex items-center gap-2 chip">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Decision simulator · Resonance 1.0
        </div>

        <h1 className="display mt-6 text-[44px] sm:text-[64px] md:text-[84px] lg:text-[96px] max-w-[14ch] mx-auto">
          Where does the <em>next hire</em> go?
        </h1>

        <p className="lede mt-6 max-w-[58ch] mx-auto">
          Bottleneck turns your company into a chain of stages, finds where work actually waits, and shows what
          moving or hiring one person does everywhere else. Every number is computed by a queueing engine —
          none is written by an AI.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/app" className="btn btn-primary">
            Open the simulator <span aria-hidden>→</span>
          </Link>
          <a href="#how" className="btn btn-ghost">
            See how it works
          </a>
        </div>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted">
          {["Deterministic engine", "Guardrail-checked prose", "Runs offline", "Textbook queueing theory"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check /> {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Product mockup with floating widgets */}
      <div className="relative mx-auto max-w-[1040px] px-5 mt-16 sm:mt-20">
        <div className="reveal is-in">
          <PipelineCard result={baseline} source={source} className="shadow-float" />
        </div>

        {hire && (
          <Widget className="hidden lg:block -left-10 top-10 -rotate-3 animate-floaty" delay="0s">
            <div className="eyebrow">{hire.label}</div>
            <div className="numeral text-3xl font-bold mt-1">
              {hire.cycle_time_days.toFixed(2)}
              <span className="text-sm font-medium text-muted ml-1">days</span>
            </div>
            <div className="text-[12px] text-muted mt-1">{inrShort(hire.incremental_cost)} / year</div>
          </Widget>
        )}

        {move && (
          <Widget className="hidden lg:block -right-12 top-24 rotate-2 animate-floaty" delay="-2.5s">
            <div className="eyebrow">{move.label.replace("->", "→")}</div>
            <div className="numeral text-3xl font-bold mt-1">
              {move.cycle_time_days.toFixed(2)}
              <span className="text-sm font-medium text-muted ml-1">days</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-good/10 text-good px-2.5 py-1 text-[12px] font-semibold">
              ₹0 {share !== null && <span className="font-medium text-good/80">· {share}% of hiring&apos;s benefit</span>}
            </div>
          </Widget>
        )}

        <Widget className="hidden md:block right-6 -bottom-6 rotate-1 animate-floaty !px-4 !py-3" delay="-4s">
          <div className="flex items-center gap-2 text-[12px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-good" /> Guardrail · 0 fabricated numbers
          </div>
        </Widget>
      </div>
    </section>
  );
}

function Widget({
  children,
  className = "",
  delay = "0s",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`absolute card px-5 py-4 shadow-float ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
