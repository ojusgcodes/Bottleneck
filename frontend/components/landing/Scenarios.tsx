"use client";

import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import PipelineCard from "@/components/ui/PipelineCard";
import { useLiveDemo } from "@/lib/useLiveDemo";
import { DEMO } from "@/lib/demo";
import { ScenarioName } from "@/lib/types";
import { inrShort } from "@/lib/format";

export default function Scenarios() {
  return (
    <section id="scenarios" className="mx-auto max-w-wrap px-5 py-20 sm:py-28 scroll-mt-24">
      <Reveal className="max-w-[44ch]">
        <div className="eyebrow">Not a hiring calculator</div>
        <h2 className="display-md mt-4 text-[38px] sm:text-[56px]">
          One engine. <em>Any chain of work.</em>
        </h2>
        <p className="lede mt-5">
          Same code, two unrelated businesses, only the numbers change. Switch between them live inside the
          simulator — don&apos;t say it&apos;s general, click the other button.
        </p>
      </Reveal>

      <div className="mt-12 grid lg:grid-cols-2 gap-5">
        <ScenarioCard name="software" delay={0} />
        <ScenarioCard name="expansion" delay={100} />
      </div>
    </section>
  );
}

function ScenarioCard({ name, delay }: { name: ScenarioName; delay: number }) {
  const { baseline, strategies, source } = useLiveDemo(name);
  const move = strategies.find((s) => s.label.startsWith("Move 1"));
  const hire = strategies.find((s) => s.label.startsWith("Hire into"));
  const meta = DEMO[name];

  return (
    <Reveal delay={delay}>
      <div className="rounded-[32px] bg-bg-2 border border-line p-3 sm:p-4 h-full flex flex-col">
        <div className="px-3 pt-3 pb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[22px] font-semibold tracking-[-0.02em]">{meta.title}</h3>
            <p className="mt-1 text-[14px] text-ink-2 max-w-[42ch]">{meta.blurb}</p>
          </div>
          <Link href={`/app?scenario=${name}`} className="btn btn-ghost btn-sm shrink-0 bg-white">
            Open <span aria-hidden>→</span>
          </Link>
        </div>

        <PipelineCard result={baseline} source={source} compact title={`${meta.title} · baseline`} />

        <div className="grid grid-cols-2 gap-3 mt-3">
          {hire && (
            <div className="rounded-2xl bg-white border border-line px-4 py-3">
              <div className="eyebrow">{hire.label.replace("->", "→")}</div>
              <div className="numeral text-2xl font-bold mt-1">
                {hire.cycle_time_days.toFixed(2)}
                <span className="text-xs font-medium text-muted ml-1">days</span>
              </div>
              <div className="text-[12px] text-muted mt-0.5">{inrShort(hire.incremental_cost)} / year</div>
            </div>
          )}
          {move && (
            <div className="rounded-2xl bg-white border border-good/30 px-4 py-3">
              <div className="eyebrow truncate">{move.label.replace("->", "→")}</div>
              <div className="numeral text-2xl font-bold mt-1">
                {move.cycle_time_days.toFixed(2)}
                <span className="text-xs font-medium text-muted ml-1">days</span>
              </div>
              <div className="text-[12px] font-semibold text-good mt-0.5">₹0 · already on payroll</div>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}
