import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy aliases for the Mapbox sidebar.
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Theme-aware semantic colours — flip with light/dark.
        canvas:        "var(--canvas)",
        "canvas-raised": "var(--canvas-raised)",
        ink:           "var(--ink)",
        "ink-muted":   "var(--ink-muted)",
        "ink-faint":   "var(--ink-faint)",
        rule:          "var(--rule)",
        "rule-strong": "var(--rule-strong)",
        accent:        "var(--accent)",
        // Brand palette — theme-independent raw colours.
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
        chapter:     ["clamp(5rem, 10vw, 10rem)",         { lineHeight: "0.95", letterSpacing: "-0.03em"  }],
        "display-1": ["clamp(2.5rem, 5vw + 1rem, 4.5rem)",  { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "display-2": ["clamp(2rem, 3.5vw + 1rem, 3.25rem)", { lineHeight: "1.10", letterSpacing: "-0.01em"  }],
        title:       ["1.75rem",   { lineHeight: "1.15", letterSpacing: "-0.01em"  }],
        section:     ["1.25rem",   { lineHeight: "1.25", letterSpacing: "-0.005em" }],
        label:       ["0.75rem",   { lineHeight: "1",    letterSpacing: "0.02em"   }],
        micro:       ["0.6875rem", { lineHeight: "1",    letterSpacing: "0.04em"   }],
      },
      borderRadius: {
        none:     "0",
        hairline: "2px",
        sm:       "4px",
        md:       "6px",
        chip:     "9999px",
        pill:     "9999px",
      },
      boxShadow: {
        // Depth comes from outlines, not shadows. Reserve for popovers only.
        modal: "0 32px 64px -16px rgb(30 30 30 / 0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
