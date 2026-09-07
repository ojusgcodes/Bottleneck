"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ScenarioName } from "@/lib/types";

interface Props {
  scenario: ScenarioName;
  onScenario: (s: ScenarioName) => void;
  connected: boolean;
}

export default function AppNav({ scenario, onScenario, connected }: Props) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-white/85 backdrop-blur-xl pl-3 pr-2 py-2 shadow-nav max-w-full">
        <Link href="/" className="flex items-center gap-2.5 pr-2" title="Back to the overview">
          <Logo size={26} />
          <span className="font-semibold tracking-[-0.02em] text-[15px] hidden sm:inline">Bottleneck</span>
        </Link>

        <div className="seg" role="tablist" aria-label="Scenario">
          <button role="tab" data-active={scenario === "software"} aria-selected={scenario === "software"} onClick={() => onScenario("software")}>
            Software team
          </button>
          <button role="tab" data-active={scenario === "expansion"} aria-selected={scenario === "expansion"} onClick={() => onScenario("expansion")}>
            Expansion
          </button>
        </div>

        <span className="chip !py-1.5 hidden md:inline-flex" title="Backend connection">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-good animate-pulse2" : "bg-accent"}`} />
          {connected ? "Engine live" : "Engine offline"}
        </span>

        <Link href="/" className="btn btn-ghost btn-sm hidden sm:inline-flex">
          Overview
        </Link>
      </nav>
    </div>
  );
}
