import Reveal from "@/components/ui/Reveal";

const STATS = [
  {
    value: "95.7%",
    label: "How busy Review is in the seed company. Past 90%, waiting stops growing gently and goes vertical.",
  },
  {
    value: "2.64",
    unit: "days",
    label: "Of a 5.29-day cycle spent waiting at that one stage. Half the total, in a team that looks uniformly busy.",
  },
  {
    value: "98%",
    label: "Of hiring's benefit captured by moving one person from Design into Review. Cost: ₹0.",
  },
  {
    value: "0",
    label: "Numbers on screen written by a language model. The engine computes; the guardrail deletes anything it didn't.",
  },
];

export default function Stats() {
  return (
    <section className="mx-auto max-w-wrap px-5 py-20 sm:py-28">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12 border-t border-line-strong pt-12">
        {STATS.map((s, i) => (
          <Reveal key={s.value} delay={i * 90}>
            <div className="numeral display text-[56px] sm:text-[64px]">
              {s.value}
              {s.unit && <span className="text-xl font-medium text-muted ml-2 tracking-normal">{s.unit}</span>}
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-2 max-w-[28ch]">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
