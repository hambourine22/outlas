import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Boilerplate aliases kept for the legacy map/sidebar.
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Brand palette — mirrors app/lib/design-system.ts.
        sand:    "rgb(var(--brand-sand) / <alpha-value>)",
        carbon:  "rgb(var(--brand-carbon) / <alpha-value>)",
        snow:    "rgb(var(--brand-snow) / <alpha-value>)",
        rust:    "rgb(var(--brand-rust) / <alpha-value>)",
        pine:    "rgb(var(--brand-pine) / <alpha-value>)",
        glacier: "rgb(var(--brand-glacier) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-vollkorn)", "ui-serif", "Georgia", "serif"],
        ui:      ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-1": ["clamp(2.5rem, 5vw + 1rem, 4.5rem)",   { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "display-2": ["clamp(2rem, 3.5vw + 1rem, 3.25rem)",  { lineHeight: "1.10", letterSpacing: "-0.01em" }],
        title:       ["1.75rem",  { lineHeight: "1.15", letterSpacing: "-0.005em" }],
        section:     ["1.25rem",  { lineHeight: "1.25" }],
        label:       ["0.75rem",  { lineHeight: "1",    letterSpacing: "0.08em" }],
        micro:       ["0.6875rem", { lineHeight: "1",   letterSpacing: "0.10em" }],
      },
      borderRadius: {
        card: "1.25rem",
        pill: "9999px",
      },
      boxShadow: {
        resting: "0 1px 2px rgb(30 30 30 / 0.06)",
        lifted:  "0 8px 24px -8px rgb(30 30 30 / 0.18)",
        modal:   "0 32px 64px -16px rgb(30 30 30 / 0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
