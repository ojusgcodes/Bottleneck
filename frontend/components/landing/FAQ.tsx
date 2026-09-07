import Reveal from "@/components/ui/Reveal";

const QA = [
  {
    q: "Isn't this just a chatbot with a nicer interface?",
    a: "No — and that's the whole point. A language model can't simulate; it can only produce text that sounds like simulation, and every number it produces is invented. Bottleneck runs a deterministic queueing engine for the modify / simulate / compare steps and lets the model do exactly one thing: turn results into sentences.",
  },
  {
    q: "Where do the numbers come from?",
    a: "Kingman's approximation for a G/G/c queue, applied to each stage in sequence: utilisation ρ = arrivals ÷ capacity, wait ≈ ρ/(1−ρ) × variability × service time ÷ headcount, and cycle time is the sum of wait + service across stages. It's textbook, it's verifiable, and it lives in one file — backend/app/engine/queueing.py — which is the only place in the codebase allowed to calculate a wait time.",
  },
  {
    q: "What does the guardrail actually do?",
    a: "Every sentence the model writes is checked against the engine's result dictionary. Any figure that doesn't appear there is deleted before the text reaches the screen, and the badge shows how many were stripped. If no API key is configured it uses a template built from the engine's numbers instead, so the demo works offline.",
  },
  {
    q: "Can it model my company, not just the demo one?",
    a: "Any chain of stages with a headcount and an average service time per stage. Two seed companies are included — a six-stage software team and a four-stage national logistics operation — and every headcount is editable live in the simulator.",
  },
  {
    q: "Why does hiring stop paying?",
    a: "Because the wait curve is flat, then nearly vertical. One extra person at a stage that's 95% busy can cut waiting by days; the same person at a stage that's 60% busy buys almost nothing. Bottleneck shows you which part of that curve you're standing on before you spend the salary.",
  },
  {
    q: "Does it need the internet?",
    a: "No. The engine, the API and the interface all run locally. The language-model explanation is optional and falls back automatically.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-wrap px-5 py-20 sm:py-28 scroll-mt-24">
      <div className="grid lg:grid-cols-12 gap-10">
        <Reveal className="lg:col-span-4">
          <div className="eyebrow">FAQ</div>
          <h2 className="display-md mt-4 text-[38px] sm:text-[48px]">
            Questions a judge <em>will ask.</em>
          </h2>
        </Reveal>
        <div className="lg:col-span-8">
          {QA.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <details className="group border-t border-line-strong last:border-b">
                <summary className="flex items-start justify-between gap-6 py-6">
                  <span className="text-[19px] sm:text-[21px] font-semibold tracking-[-0.02em] leading-snug">
                    {item.q}
                  </span>
                  <span className="faq-plus shrink-0 mt-1 w-8 h-8 rounded-full border border-line-strong flex items-center justify-center text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="pb-7 -mt-1 text-[15px] sm:text-[16px] leading-relaxed text-ink-2 max-w-[68ch]">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
