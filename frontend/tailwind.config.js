/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // rgb(var(--x-rgb) / <alpha-value>) so bg-good/10, border-accent/40 etc. work
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        "bg-2": "rgb(var(--bg-2-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        "ink-2": "rgb(var(--ink-2-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        good: "rgb(var(--good-rgb) / <alpha-value>)",
        amber: "rgb(var(--amber-rgb) / <alpha-value>)",
        dark: "rgb(var(--dark-rgb) / <alpha-value>)",
        "dark-2": "rgb(var(--dark-2-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "28px",
        "4xl": "36px",
        "5xl": "48px",
      },
      boxShadow: {
        float: "0 30px 80px -30px rgba(10,10,10,0.35), 0 8px 24px -12px rgba(10,10,10,0.18)",
        card: "0 1px 0 rgba(10,10,10,0.04), 0 12px 40px -24px rgba(10,10,10,0.25)",
        nav: "0 10px 40px -16px rgba(10,10,10,0.35)",
      },
      maxWidth: {
        wrap: "1200px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse2: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.8)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
        pulse2: "pulse2 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
