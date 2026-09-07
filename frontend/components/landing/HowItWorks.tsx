import Reveal from "@/components/ui/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Decision twin",
    body: "Describe the company: stages, people per stage, how long each piece of work takes. It becomes a model the engine can run — and re-run every time you touch a number.",
    art: <ArtPipeline />,
    span: "lg:col-span-3",
  },
  {
    n: "02",
    title: "Future generator",
    body: "Do nothing. Hire into the bottleneck. Move one person from wherever there's slack. Hire two. Every option is a real run of the same engine, laid side by side with its cost.",
    art: <ArtOptions />,
    span: "lg:col-span-3",
  },
  {
    n: "03",
    title: "Decision ripple",
    body: "Drag one stage's headcount. The whole consequence chain recomputes live — not a cached answer, a fresh calculation on every tick.",
    art: <ArtRipple />,
    span: "lg:col-span-2",
  },
  {
    n: "04",
    title: "Hidden trade-offs",
    body: "The engine scans every stage and flags what you didn't ask about: slack you already own, and where the bottleneck will move next.",
    art: <ArtFlags />,
    span: "lg:col-span-2",
  },
  {
    n: "05",
    title: "Red team + adapt",
    body: "Demand +30%, headcount −15%. Does the plan survive? If not, it searches nearby plans for one that does.",
    art: <ArtStress />,
    span: "lg:col-span-2",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-wrap px-5 py-20 sm:py-28 scroll-mt-24">
      <Reveal className="max-w-[40ch]">
        <div className="eyebrow">How it works</div>
        <h2 className="display-md mt-4 text-[38px] sm:text-[56px]">
          Five moments. <em>One engine.</em>
        </h2>
        <p className="lede mt-5">
          Modify, simulate, compare — those are computation, so a deterministic engine does them. Understand is
          language, so that&apos;s the only job the AI gets.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-6 gap-4">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 70} className={`${s.span}`}>
            <article className="card h-full p-7 sm:p-8 flex flex-col group">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-ink">{s.n}</span>
                <span className="w-2 h-2 rounded-full bg-ink/15 group-hover:bg-accent transition-colors" />
              </div>
              <div className="mt-6 h-[140px] rounded-2xl bg-bg-2 border border-line flex items-center justify-center overflow-hidden">
                {s.art}
              </div>
              <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.02em]">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- little illustrations (pure SVG, no libs) ---------- */

function ArtPipeline() {
  const bars = [0.55, 0.5, 0.62, 0.96, 0.6, 0.5];
  return (
    <svg viewBox="0 0 220 100" width="220" height="100" aria-hidden>
      {bars.map((u, i) => (
        <g key={i}>
          <rect x={14 + i * 34} y={10} width={22} height={70} rx={6} fill="rgba(10,10,10,0.06)" />
          <rect
            x={14 + i * 34}
            y={80 - u * 70}
            width={22}
            height={u * 70}
            rx={6}
            fill={u > 0.9 ? "var(--accent)" : "var(--ink)"}
          />
        </g>
      ))}
      <line x1="8" x2="212" y1={80 - 0.9 * 70} y2={80 - 0.9 * 70} stroke="rgba(10,10,10,0.3)" strokeDasharray="3 3" />
    </svg>
  );
}

function ArtOptions() {
  const rows = [
    { l: "Do nothing", v: "5.29", w: 1 },
    { l: "Hire into Review", v: "2.88", w: 0.54 },
    { l: "Move 1 · Design → Review", v: "2.93", w: 0.55, free: true },
  ];
  return (
    <svg viewBox="0 0 260 100" width="260" height="100" aria-hidden>
      {rows.map((r, i) => (
        <g key={r.l} transform={`translate(10 ${12 + i * 28})`}>
          <rect width="240" height="22" rx="11" fill="#fff" stroke="rgba(10,10,10,0.1)" />
          <rect width={240 * r.w} height="22" rx="11" fill={r.free ? "rgba(26,138,86,0.14)" : "rgba(10,10,10,0.06)"} />
          <text x="12" y="15" fontSize="10" fontFamily="var(--font-sans)" fontWeight="600" fill="var(--ink)">
            {r.l}
          </text>
          <text x="228" y="15" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)" fill="var(--ink)">
            {r.v}d
          </text>
        </g>
      ))}
    </svg>
  );
}

function ArtRipple() {
  return (
    <svg viewBox="0 0 200 100" width="200" height="100" aria-hidden>
      <line x1="20" x2="180" y1="30" y2="30" stroke="rgba(10,10,10,0.15)" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" x2="110" y1="30" y2="30" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="110" cy="30" r="9" fill="#fff" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="20" y="80" fontSize="22" fontWeight="700" fontFamily="var(--font-sans)" fill="rgba(10,10,10,0.35)" letterSpacing="-1">
        5.29
      </text>
      <path d="M84 73h26m-6-6l6 6-6 6" stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <text x="122" y="80" fontSize="22" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--ink)" letterSpacing="-1">
        2.88
      </text>
    </svg>
  );
}

function ArtFlags() {
  const rows = ["Design is 50% utilized — slack you already own", "Add 2 to Review and Build becomes the constraint"];
  return (
    <svg viewBox="0 0 220 100" width="220" height="100" aria-hidden>
      {rows.map((t, i) => (
        <g key={i} transform={`translate(10 ${22 + i * 34})`}>
          <rect width="200" height="26" rx="8" fill="#fff" stroke="rgba(10,10,10,0.1)" />
          <circle cx="14" cy="13" r="4" fill={i === 0 ? "var(--good)" : "var(--amber)"} />
          <text x="26" y="17" fontSize="8.5" fontFamily="var(--font-sans)" fill="var(--ink-2)">
            {t}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ArtStress() {
  return (
    <svg viewBox="0 0 200 100" width="200" height="100" aria-hidden>
      <g fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted)">
        <text x="16" y="14">ORIGINAL</text>
        <text x="112" y="14">ADAPTED</text>
      </g>
      <rect x="16" y="22" width="70" height="10" rx="5" fill="rgba(10,10,10,0.12)" />
      <rect x="16" y="22" width="24" height="10" rx="5" fill="var(--ink)" />
      <rect x="16" y="38" width="70" height="10" rx="5" fill="rgba(255,77,31,0.15)" />
      <rect x="16" y="38" width="70" height="10" rx="5" fill="var(--accent)" />
      <rect x="112" y="22" width="70" height="10" rx="5" fill="rgba(10,10,10,0.12)" />
      <rect x="112" y="22" width="20" height="10" rx="5" fill="var(--ink)" />
      <rect x="112" y="38" width="70" height="10" rx="5" fill="rgba(26,138,86,0.15)" />
      <rect x="112" y="38" width="34" height="10" rx="5" fill="var(--good)" />
      <g fontFamily="var(--font-sans)" fontSize="9" fill="var(--ink-2)">
        <text x="16" y="70">normal · stress</text>
        <text x="112" y="70">normal · stress</text>
      </g>
      <text x="16" y="90" fontSize="9" fontFamily="var(--font-mono)" fill="var(--muted)">
        demand ×1.3 · heads ×0.85
      </text>
    </svg>
  );
}
