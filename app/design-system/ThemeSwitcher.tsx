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
            onClick={() => pick(m)}
            className={[
              "label rounded-pill px-3 py-1.5 transition-colors",
              active ? "bg-ink text-canvas" : "text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            {m}
          </button>
        );
      })}
    </div>
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
