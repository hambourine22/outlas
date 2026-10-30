"use client";

import { useEffect, useState } from "react";
import type { ThemeMode } from "@/app/lib/design-system";

const STORAGE_KEY = "outlas:theme";
const MODES: ThemeMode[] = ["light", "system", "dark"];

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
}

export function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
      setMode(stored);
      applyTheme(stored);
    } catch {
      // private mode, blocked storage — leave at system default.
    }
    setMounted(true);
  }, []);

  function pick(next: ThemeMode) {
    setMode(next);
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-pill border border-rule p-0.5"
      role="radiogroup"
      aria-label="Theme"
    >
      {MODES.map((m) => {
        const active = mounted && mode === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={THEME_LABEL[m]}
            title={THEME_LABEL[m]}
            onClick={() => pick(m)}
            className={[
              "flex h-7 w-7 items-center justify-center rounded-pill transition-colors",
              active ? "bg-ink text-canvas" : "text-ink-muted hover:bg-[var(--row-hover)] hover:text-ink",
            ].join(" ")}
          >
            <ThemeIcon mode={m} />
          </button>
        );
      })}
    </div>
  );
}

const THEME_LABEL: Record<ThemeMode, string> = {
  light: "Light theme",
  system: "System theme",
  dark: "Dark theme",
};

/* Three glyphs for the mode toggle:
 * - Light  → sun (dot + eight rays)
 * - System → monitor (framed screen with a baseline)
 * - Dark   → crescent moon
 * All drawn at 16×16 on a 24×24 viewBox, 1.6 stroke to match the
 * hamburger/close icons already in the TopBar. */
function ThemeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "light") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (mode === "dark") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // system
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* Blocking inline script — runs before paint to apply the stored theme and
 * avoid a flash of the wrong mode on first load. Ship it in <head>. */
export const themeBootstrapScript = `
try {
  var m = localStorage.getItem('${STORAGE_KEY}');
  if (m === 'light' || m === 'dark') document.documentElement.setAttribute('data-theme', m);
} catch (_) {}
`;
