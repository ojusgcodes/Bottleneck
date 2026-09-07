"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#cliff", label: "The cliff" },
  { href: "#guardrail", label: "Guardrail" },
  { href: "#scenarios", label: "Scenarios" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <nav
        className={`pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-white/80 backdrop-blur-xl pl-3 pr-2 py-2 transition-shadow duration-300 ${
          scrolled ? "shadow-nav" : "shadow-[0_1px_0_rgba(10,10,10,0.04)]"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 pr-3">
          <Logo size={26} />
          <span className="font-semibold tracking-[-0.02em] text-[15px]">Bottleneck</span>
        </Link>

        <div className="hidden md:flex items-center">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-full text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-ink/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <Link href="/app" className="btn btn-primary btn-sm ml-1">
          Open simulator
          <span aria-hidden>→</span>
        </Link>

        <button
          className="md:hidden step ml-1 !w-9 !h-9"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            {open ? (
              <path d="M3 3l10 10M13 3L3 13" />
            ) : (
              <path d="M2 4h12M2 8h12M2 12h12" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="pointer-events-auto absolute top-[68px] left-4 right-4 md:hidden">
          <div className="card p-2 flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl text-[15px] font-medium hover:bg-ink/5"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
