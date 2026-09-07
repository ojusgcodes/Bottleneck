/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bdark: "#1E2761",
        bprimary: "#2F3C7E",
        bcoral: "#F96167",
        bsuccess: "#0F7A5F",
        bamber: "#B06400",
      },
    },
  },
  plugins: [],
};
