"use client";

import { useMemo, useState } from "react";
import Reveal from "@/components/ui/Reveal";

/** Kingman's congestion factor ρ/(1−ρ), normalised so 50% busy = 1×. */
function waitMultiple(rho: number) {
  return rho / (1 - rho);
}

const W = 560;
const H = 300;
const PAD = { l: 44, r: 20, t: 20, b: 40 };
const RHO_MIN = 0.3;
const RHO_MAX = 0.97;
const Y_MAX = 24;

function x(rho: number) {
  return PAD.l + ((rho - RHO_MIN) / (RHO_MAX - RHO_MIN)) * (W - PAD.l - PAD.r);
}
function y(mult: number) {
  const v = Math.min(mult, Y_MAX);
  return H - PAD.b - (v / Y_MAX) * (H - PAD.t - PAD.b);
}

export default function Cliff() {
  const [rho, setRho] = useState(0.9);
  const mult = waitMultiple(rho);

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let r = RHO_MIN; r <= RHO_MAX + 1e-9; r += 0.005) {
      pts.push(`${x(r).toFixed(1)},${y(waitMultiple(r)).toFixed(1)}`);
    }
    return "M" + pts.join(" L");
  }, []);

  const marks = [0.5, 0.8, 0.9, 0.95];
  const fill = ((rho - RHO_MIN) / (RHO_MAX - RHO_MIN)) * 100;

  return (
    <section id="cliff" className="mx-auto max-w-wrap px-5 py-20 sm:py-28 scroll-mt-24">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <Reveal className="lg:col-span-5">
          <div className="eyebrow">Why it&apos;s worth building</div>
          <h2 className="display-md mt-4 text-[38px] sm:text-[56px]">
            Every system <em>has a cliff.</em>
          </h2>
          <p className="lede mt-5">
            Going from half-busy to 90% busy doesn&apos;t make you wait a bit longer. It makes you wait{" "}
            <strong className="text-ink font-semibold">nine times</strong> longer. At 95%, it doubles again.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
            Spare capacity isn&apos;t waste — it&apos;s what lets a team absorb bad luck. Every manager&apos;s
            instinct pushes people toward 100% busy, and the maths says that is exactly what makes them slow.
            Most companies live on the steep side without knowing it.
          </p>
          <p className="mt-4 eyebrow">Kingman&apos;s formula · the same one the engine uses</p>
        </Reveal>

        <Reveal className="lg:col-span-7" delay={120}>
          <div className="card p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div className="eyebrow text-ink">Wait time vs. how busy the team is</div>
              <div className="numeral text-sm font-semibold">
                <span className="text-muted font-medium">at</span> {(rho * 100).toFixed(0)}% busy{" "}
                <span className="text-muted font-medium">→</span>{" "}
                <span className={mult >= 9 ? "text-accent" : ""}>{mult.toFixed(1)}×</span>{" "}
                <span className="text-muted font-medium">the wait</span>
              </div>
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-4" role="img" aria-label="Wait time rises slowly then almost vertically as utilisation approaches 100%">
              {/* gridlines */}
              {[0, 5, 10, 15, 20].map((v) => (
                <g key={v}>
                  <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="rgba(10,10,10,0.07)" />
                  <text x={PAD.l - 8} y={y(v) + 3} fontSize="10" textAnchor="end" fill="var(--muted)" fontFamily="var(--font-mono)">
                    {v}×
                  </text>
                </g>
              ))}
              {marks.map((m) => (
                <g key={m}>
                  <line x1={x(m)} x2={x(m)} y1={PAD.t} y2={H - PAD.b} stroke="rgba(10,10,10,0.07)" />
                  <text x={x(m)} y={H - PAD.b + 16} fontSize="10" textAnchor="middle" fill="var(--muted)" fontFamily="var(--font-mono)">
                    {Math.round(m * 100)}%
                  </text>
                </g>
              ))}
              <text x={W - PAD.r} y={H - 6} fontSize="10" textAnchor="end" fill="var(--muted)" fontFamily="var(--font-mono)">
                HOW BUSY
              </text>

              {/* the cliff */}
              <rect x={x(0.9)} y={PAD.t} width={x(RHO_MAX) - x(0.9)} height={H - PAD.t - PAD.b} fill="rgba(255,77,31,0.06)" />
              <text x={x(0.9) + 6} y={PAD.t + 12} fontSize="10" fill="var(--accent)" fontFamily="var(--font-mono)">
                THE CLIFF
              </text>

              <path d={path} fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />

              {marks.map((m) => (
                <circle key={m} cx={x(m)} cy={y(waitMultiple(m))} r="3.5" fill="#fff" stroke="var(--ink)" strokeWidth="1.5" />
              ))}

              {/* live marker */}
              <line x1={x(rho)} x2={x(rho)} y1={y(mult)} y2={H - PAD.b} stroke="var(--accent)" strokeDasharray="3 3" />
              <circle cx={x(rho)} cy={y(mult)} r="7" fill="var(--accent)" stroke="#fff" strokeWidth="2.5" />
            </svg>

            <div className="mt-4">
              <input
                type="range"
                className="range"
                min={RHO_MIN * 100}
                max={RHO_MAX * 100}
                step={1}
                value={Math.round(rho * 100)}
                style={{ ["--fill" as any]: `${fill}%` }}
                onChange={(e) => setRho(parseInt(e.target.value, 10) / 100)}
                aria-label="Team utilisation"
              />
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {marks.map((m) => (
                  <button
                    key={m}
                    onClick={() => setRho(m)}
                    className="rounded-2xl border border-line bg-bg-2 px-2 py-2 hover:bg-white transition-colors"
                  >
                    <div className="eyebrow !text-[10px]">{Math.round(m * 100)}% busy</div>
                    <div className="numeral font-bold text-lg">{waitMultiple(m).toFixed(0)}×</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
