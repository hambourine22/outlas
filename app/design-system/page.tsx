import Image from "next/image";
import {
  colors,
  surfaces,
  typography,
  radii,
  outlines,
  spacing,
  providers,
  scoreDimensions,
  scoreBands,
  mapLegend,
  principles,
  voice,
  themes,
  grid,
  dataviz,
} from "@/app/lib/design-system";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LineChart, ChartLegend, BarChart, RadarChart } from "./Chart";

export const metadata = {
  title: "Oütlas — Design System",
  description:
    "Living reference for Oütlas brand tokens, type, surfaces, and UX patterns.",
};

const colorOrder = ["sand", "carbon", "snow", "rust", "pine", "glacier"] as const;
const surfaceOrder = ["rental", "repair", "story", "manifest", "default"] as const;

const CHAPTERS = [
  { n: "01", slug: "voice",      title: "Voice" },
  { n: "02", slug: "logo",       title: "Logo" },
  { n: "03", slug: "palette",    title: "Palette" },
  { n: "04", slug: "themes",     title: "Themes" },
  { n: "05", slug: "grid",       title: "Grid & Layout" },
  { n: "06", slug: "surfaces",   title: "Surfaces" },
  { n: "07", slug: "type",       title: "Type" },
  { n: "08", slug: "space",      title: "Space & Outline" },
  { n: "09", slug: "principles", title: "Principles" },
  { n: "10", slug: "providers",  title: "Providers" },
  { n: "11", slug: "score",      title: "Score Pills" },
  { n: "12", slug: "map",        title: "Map Legend" },
  { n: "13", slug: "dataviz",    title: "Data Viz" },
];

const TOTAL = CHAPTERS.length;

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <Masthead />
      <Chapter n="01" title="Voice" intro="Three lines, read in order. The manifesto expands the ladder; the tagline compresses it.">
        <Voice />
      </Chapter>
      <Chapter n="02" title="Logo" intro="The Ü logomark is the signature; the wordmark anchors long-form surfaces. One brand colour per surface — never recolour outside the palette.">
        <Logos />
      </Chapter>
      <Chapter n="03" title="Palette" intro="Six brand colours, each with a named role. Every value exists in the token file; nothing is picked by eye.">
        <Palette />
      </Chapter>
      <Chapter n="04" title="Themes" intro="Light, dark, and system modes. Semantic tokens flip; brand surfaces stay intentional in either theme.">
        <Themes />
      </Chapter>
      <Chapter n="05" title="Grid & Layout" intro="A 4×4 structure forms a 12-column grid. Margins and gutters are a percentage of the viewport. Everything rounds to the nearest 4px.">
        <GridLayout />
      </Chapter>
      <Chapter n="06" title="Surfaces" intro="Each UX moment binds to a surface via data-surface. CSS variables carry background, accent and ink down the tree.">
        <Surfaces />
      </Chapter>
      <Chapter n="07" title="Type" intro="Vollkorn for editorial display and body — it carries the storytelling. Archivo Narrow for UI labels, meta, and navigation chrome.">
        <TypeScale />
      </Chapter>
      <Chapter n="08" title="Space & Outline" intro="One ladder each. Every rung is a multiple of 4px. Depth comes from outline weight, never drop shadow.">
        <SpaceRadiiOutline />
      </Chapter>
      <Chapter n="09" title="Principles" intro="Four load-bearing rules behind every surface.">
        <Principles />
      </Chapter>
      <Chapter n="10" title="Providers" intro="The three-circle taxonomy. Every supplier maps to exactly one; service-provider carries the Ü mark.">
        <Providers />
      </Chapter>
      <Chapter n="11" title="Score Pills" intro="Resort pillars are rendered as pills — a 0–5 band drives colour; the number is secondary.">
        <ScorePills />
      </Chapter>
      <Chapter n="12" title="Map Legend" intro="Shared across the Scotland map and every regional map that follows.">
        <MapLegend />
      </Chapter>
      <Chapter n="13" title="Data Viz" intro="Oütlas dataviz builds on the brand palette with solid Carbon axes, hairline dashed grids, and chip-tagged series. Transparent on canvas by default.">
        <Dataviz />
      </Chapter>
      <Footer />
    </main>
  );
}

/* ---------- layout primitives ---------- */

function Chapter({
  n,
  title,
  intro,
  children,
}: {
  n: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-rule">
      {/* Chapter header: left narration, vertical rule, right huge numeral + page mark. */}
      <header className="grid grid-cols-12 gap-0">
        <div className="col-span-12 border-b border-rule px-6 py-12 md:col-span-5 md:border-b-0 md:border-r md:px-10 md:py-16 lg:px-14 lg:py-20">
          <h2 className="font-display text-display-2">{title}</h2>
          <p className="mt-6 max-w-sm font-ui text-sm leading-relaxed text-ink-muted">{intro}</p>
        </div>
        <div className="col-span-12 flex items-start justify-between px-6 py-12 md:col-span-7 md:px-10 md:py-16 lg:px-14 lg:py-20">
          <span className="font-display text-chapter leading-none">{n}</span>
          <span className="micro text-ink-faint">{n} / {String(TOTAL).padStart(2, "0")}</span>
        </div>
      </header>
      {/* Body: full-width content below the chapter header. */}
      <div className="border-t border-rule px-6 py-12 md:px-10 md:py-16 lg:px-14 lg:py-20">
        {children}
      </div>
    </section>
  );
}

/* ---------- masthead ---------- */

function Masthead() {
  return (
    <header className="bg-canvas text-ink">
      <div className="flex items-start justify-between px-6 pt-6 md:px-10 md:pt-10 lg:px-14 lg:pt-14">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/mark/U_green.png"
            alt="Oütlas Ü logomark"
            width={904}
            height={1314}
            priority
            className="h-10 w-auto dark:hidden"
          />
          <Image
            src="/brand/mark/U_white.png"
            alt="Oütlas Ü logomark"
            width={904}
            height={1314}
            priority
            className="hidden h-10 w-auto dark:block"
          />
          <span className="chip">v2 · Oütlas Design System</span>
        </div>
        <ThemeSwitcher />
      </div>

      <div className="grid grid-cols-12 gap-0 px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24 lg:px-14 lg:pb-36 lg:pt-32">
        <div className="col-span-12 md:col-span-7">
          <span className="label text-ink-muted">Share · Buy · Ride</span>
          <h1 className="mt-6 font-display text-display-1 leading-[1.02]">
            Share gear.
            <br />
            Buy less.
            <br />
            Ride more.
          </h1>
        </div>
        <aside className="col-span-12 mt-10 md:col-span-5 md:mt-0 md:border-l md:border-rule md:pl-10 lg:pl-14">
          <span className="label text-ink-muted">Manifesto</span>
          <p className="mt-6 max-w-sm font-ui text-base leading-relaxed">
            {voice.manifesto}
          </p>
          <p className="mt-10 font-ui text-xs text-ink-faint">
            Brand by Tom Lenartowicz / Thrilly, March 2020.
            <br />
            System v2 by HUX, 2026.
          </p>
        </aside>
      </div>
    </header>
  );
}

/* ---------- sections ---------- */

function Voice() {
  return (
    <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
      {voice.ladder.map((line, i) => (
        <div
          key={line}
          className="flex flex-col gap-6 border-rule p-8 md:border-r md:[&:last-child]:border-r-0"
        >
          <span className="chip">0{i + 1}</span>
          <p className="font-display text-title">{line}</p>
          <span className="font-ui text-xs text-ink-faint">
            {["verb", "reason", "reward"][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function Logos() {
  const lockups: { color: string; bg: string; invert: boolean }[] = [
    { color: "green",  bg: "bg-canvas-raised", invert: false },
    { color: "yellow", bg: "bg-pine",          invert: true  },
    { color: "red",    bg: "bg-sand",          invert: false },
    { color: "white",  bg: "bg-carbon",        invert: true  },
    { color: "black",  bg: "bg-glacier",       invert: false },
    { color: "blue",   bg: "bg-carbon",        invert: true  },
  ];
  return (
    <div className="space-y-16">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="chip">Primary</span>
          <span className="micro text-ink-faint">Ü logomark · 904 × 1314</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-rule md:grid-cols-3">
          {lockups.map((l) => (
            <div
              key={l.color}
              className={`${l.bg} flex items-center justify-center p-12`}
            >
              <Image
                src={`/brand/mark/U_${l.color}.png`}
                alt={`Ü mark, ${l.color}`}
                width={904}
                height={1314}
                className="h-24 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="chip">Stacked 01</span>
          <span className="micro text-ink-faint">Oütlas wordmark · 2213 × 478</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-rule md:grid-cols-3">
          {lockups.map((l) => (
            <div
              key={`wm-${l.color}`}
              className={`${l.bg} flex items-center justify-center p-12`}
            >
              <Image
                src={`/brand/logotype/logotype_${l.color}.png`}
                alt={`Oütlas wordmark, ${l.color}`}
                width={2213}
                height={478}
                className="h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Palette() {
  return (
    <div className="grid grid-cols-1 gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
      {colorOrder.map((key) => {
        const c = colors[key];
        return (
          <article key={key} className="bg-canvas-raised">
            <div className="h-40 border-b border-rule" style={{ background: c.hex }} />
            <div className="space-y-4 p-6 font-ui">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-title">{c.name}</h3>
                <span className="chip">{key}</span>
              </div>
              <dl className="grid grid-cols-[56px_1fr] gap-y-1.5 text-sm text-ink-muted">
                <dt className="label text-ink-faint">Hex</dt>
                <dd className="font-mono">{c.hex}</dd>
                <dt className="label text-ink-faint">Rgb</dt>
                <dd className="font-mono">{c.rgb}</dd>
                <dt className="label text-ink-faint">Cmyk</dt>
                <dd className="font-mono">{c.cmyk}</dd>
              </dl>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Themes() {
  return (
    <div className="grid grid-cols-1 gap-px bg-rule md:grid-cols-2">
      {(Object.entries(themes) as [keyof typeof themes, typeof themes.light][]).map(
        ([name, t]) => (
          <div
            key={name}
            className="flex min-h-72 flex-col justify-between p-10"
            style={{ background: t.canvas, color: t.ink }}
          >
            <div className="flex items-center justify-between">
              <span
                className="chip"
                style={{ borderColor: t.rule, color: t.ink }}
              >
                {name}
              </span>
              <span
                className="micro"
                style={{ color: t.inkMuted }}
              >
                data-theme=&quot;{name}&quot;
              </span>
            </div>
            <div className="space-y-3">
              <h3 className="font-display text-display-2">Share gear.</h3>
              <p className="font-ui text-sm" style={{ color: t.inkMuted }}>
                Semantic tokens flip; brand surfaces stay intentional.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-0.5">
              {([
                { role: "canvas", c: t.canvas },
                { role: "ink",    c: t.ink },
                { role: "accent", c: t.accent },
                { role: "rule",   c: t.rule },
              ]).map(({ role, c }) => (
                <div
                  key={role}
                  className="relative h-10"
                  style={{
                    background: c,
                    border: `1px solid ${t.rule}`,
                  }}
                  title={`${role} ${c}`}
                >
                  <span
                    className="micro absolute bottom-1 left-1"
                    style={{ color: t.inkMuted }}
                  >
                    {role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ),
      )}
      <div
        className="flex min-h-72 flex-col justify-between bg-canvas-raised p-10 md:col-span-2"
      >
        <div className="flex items-center justify-between">
          <span className="chip">system</span>
          <span className="micro text-ink-faint">prefers-color-scheme</span>
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-display-2">Match the device.</h3>
          <p className="max-w-md font-ui text-sm text-ink-muted">
            With no explicit <code className="font-mono text-xs">data-theme</code> set, the page
            honours the viewer&rsquo;s OS preference via the <code className="font-mono text-xs">prefers-color-scheme</code> media query. The toggle above persists an override in <code className="font-mono text-xs">localStorage</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

function GridLayout() {
  const quartet = [
    { big: `${grid.scaleTo[0]}×${grid.scaleTo[0] / 3}`, label: "Columns",
      body: `A ${Math.sqrt(grid.columns ** 2) === 12 ? "4×4" : "4×4"} structure forms a ${grid.columns}-column grid. On narrower formats it scales down to ${grid.scaleTo.slice(1).join(", ")} columns.` },
    { big: `${grid.marginPct}%`, label: "Margins",
      body: `Margins are ${grid.marginPct}% of the viewport's shortest side. Round the pixel value to the nearest ${grid.baseUnit}px.` },
    { big: `2×${grid.marginPct}%`, label: "Gutter",
      body: `Gutters are twice the margin (${grid.gutterPct}%), so values stay uniform on both sides when applying line-informed layouts.` },
    { big: `${grid.baseUnit}px`, label: "Base unit",
      body: `Everything — spacing, type, radii — resolves to a multiple of ${grid.baseUnit}px. Round to the nearest ${grid.baseUnit}px when in doubt.` },
  ];
  return (
    <div className="space-y-16">
      {/* The quartet — big numeral + label + body, mirrors the TwelveLabs layout spread. */}
      <div className="grid grid-cols-1 gap-px bg-rule md:grid-cols-2 lg:grid-cols-4">
        {quartet.map((q) => (
          <div key={q.label} className="bg-canvas-raised p-8">
            <div className="font-display text-chapter leading-none text-ink">{q.big}</div>
            <h3 className="mt-8 font-display text-section">{q.label}</h3>
            <p className="mt-3 max-w-xs font-ui text-sm leading-relaxed text-ink-muted">{q.body}</p>
          </div>
        ))}
      </div>

      {/* 12-column grid overlay — shows the actual grid, in situ. */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="chip">Overlay</span>
          <span className="micro text-ink-faint">
            {grid.columns} columns · {grid.marginPct}% margin · {grid.gutterPct}% gutter
          </span>
        </div>
        <div className="relative border-y border-rule py-16">
          {/* columns */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-12 gap-2 px-[4%]">
            {Array.from({ length: grid.columns }).map((_, i) => (
              <div
                key={i}
                className="h-full bg-accent/10"
                style={{ outline: "1px dashed var(--rule)" }}
              />
            ))}
          </div>
          {/* content sitting on the grid */}
          <div className="relative grid grid-cols-12 gap-2 px-[4%]">
            <div className="col-span-5 bg-ink/5 p-4 font-ui text-xs text-ink-muted">col-span-5</div>
            <div className="col-span-7 bg-ink/5 p-4 font-ui text-xs text-ink-muted">col-span-7</div>
            <div className="col-span-3 bg-ink/5 p-4 font-ui text-xs text-ink-muted">col-span-3</div>
            <div className="col-span-6 bg-ink/5 p-4 font-ui text-xs text-ink-muted">col-span-6</div>
            <div className="col-span-3 bg-ink/5 p-4 font-ui text-xs text-ink-muted">col-span-3</div>
            <div className="col-span-12 bg-ink/5 p-4 font-ui text-xs text-ink-muted">col-span-12</div>
          </div>
        </div>
      </div>

      {/* Breakpoints */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="chip">Breakpoints</span>
          <span className="micro text-ink-faint">how the grid collapses</span>
        </div>
        <table className="w-full border-collapse font-ui text-sm">
          <thead>
            <tr>
              <th className="label border-b border-rule py-3 pr-4 text-left text-ink-faint">Rung</th>
              <th className="label border-b border-rule py-3 pr-4 text-left text-ink-faint">Min width</th>
              <th className="label border-b border-rule py-3 pr-4 text-left text-ink-faint">Columns</th>
              <th className="label border-b border-rule py-3 text-left text-ink-faint">Notes</th>
            </tr>
          </thead>
          <tbody>
            {[
              { rung: "base", min: 0,               cols: 2,  notes: "Phone — ladder content, stack sections." },
              { rung: "sm",   min: grid.breakpoints.sm, cols: 4,  notes: "Large phone / small tablet." },
              { rung: "md",   min: grid.breakpoints.md, cols: 6,  notes: "Tablet — two editorial columns." },
              { rung: "lg",   min: grid.breakpoints.lg, cols: 8,  notes: "Small laptop — chapter headers split 5/7." },
              { rung: "xl",   min: grid.breakpoints.xl, cols: 12, notes: "Desktop — the full 4×4 grid." },
            ].map((b) => (
              <tr key={b.rung}>
                <td className="label border-b border-rule py-3 pr-4">{b.rung}</td>
                <td className="border-b border-rule py-3 pr-4 font-mono text-xs text-ink-muted">
                  {b.min}px
                </td>
                <td className="border-b border-rule py-3 pr-4 font-display">{b.cols}</td>
                <td className="border-b border-rule py-3 text-ink-muted">{b.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Surfaces() {
  return (
    <div className="grid grid-cols-1 gap-px bg-rule md:grid-cols-2 lg:grid-cols-5">
      {surfaceOrder.map((key) => {
        const s = surfaces[key];
        return (
          <div
            key={key}
            data-surface={key === "default" ? undefined : key}
            className="flex min-h-56 flex-col justify-between p-6"
            style={{ background: "var(--canvas)", color: "var(--ink)" }}
          >
            <div>
              <span
                className="chip"
                style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
              >
                {key}
              </span>
              <h3 className="mt-6 font-display text-title">{key}</h3>
            </div>
            <div className="font-ui text-xs opacity-70">
              <div>bg {s.bg}</div>
              <div>ink {s.ink}</div>
              <div>accent {s.accent}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TypeScale() {
  const rows: {
    token: keyof typeof typography.scale;
    sample: string;
    family: "display" | "ui";
  }[] = [
    { token: "chapter",  sample: "01",                                                      family: "display" },
    { token: "display1", sample: "Share gear.",                                              family: "display" },
    { token: "display2", sample: "We connect riders to low carbon methods.",                 family: "display" },
    { token: "title",    sample: "Ski Touring & Risk Space",                                 family: "display" },
    { token: "section",  sample: "Resort Score",                                             family: "display" },
    { token: "body",     sample: "Cairn Gorm is a mountain and listed Munro in the Scottish Highlands.", family: "display" },
    { token: "label",    sample: "Join the movement",                                        family: "ui"      },
    { token: "micro",    sample: "Rental · GB",                                              family: "ui"      },
  ];
  return (
    <div className="divide-y divide-rule border-y border-rule">
      {rows.map((r) => {
        const t = typography.scale[r.token];
        return (
          <div key={r.token} className="grid gap-4 py-8 md:grid-cols-[200px_1fr] md:gap-10">
            <div className="font-ui text-xs text-ink-faint">
              <div className="label text-ink">{r.token}</div>
              <div className="mt-3 font-mono">{t.size}</div>
              <div className="font-mono">lh {t.line}</div>
              {"tracking" in t ? <div className="font-mono">tr {(t as { tracking: string }).tracking}</div> : null}
            </div>
            <div
              className="text-ink"
              style={{
                fontFamily:
                  r.family === "display" ? typography.families.display : typography.families.ui,
                fontSize: t.size,
                lineHeight: t.line,
                letterSpacing: "tracking" in t ? (t as { tracking: string }).tracking : undefined,
                textTransform:
                  "transform" in t ? ((t as { transform: string }).transform as "uppercase") : undefined,
                fontWeight: r.family === "ui" ? 700 : 500,
              }}
            >
              {r.sample}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SpaceRadiiOutline() {
  return (
    <div className="grid grid-cols-1 gap-px bg-rule lg:grid-cols-3">
      <div className="bg-canvas-raised p-8">
        <h3 className="label text-ink-muted">Spacing</h3>
        <ul className="mt-6 space-y-2 font-ui text-sm">
          {Object.entries(spacing).map(([k, v]) => (
            <li key={k} className="flex items-center gap-4">
              <span className="w-10 font-mono text-ink-faint">{k}</span>
              <span className="h-3 bg-accent" style={{ width: v }} />
              <span className="font-mono text-xs text-ink-faint">{v}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-canvas-raised p-8">
        <h3 className="label text-ink-muted">Radii</h3>
        <div className="mt-6 grid grid-cols-2 gap-6">
          {Object.entries(radii).map(([k, v]) => (
            <div key={k} className="flex flex-col items-center gap-2 font-ui text-xs">
              <div
                className="h-20 w-20 bg-accent"
                style={{ borderRadius: v }}
              />
              <div className="font-mono">{k}</div>
              <div className="text-ink-faint">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-canvas-raised p-8">
        <h3 className="label text-ink-muted">Outlines</h3>
        <div className="mt-6 space-y-4">
          {Object.entries(outlines).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between px-4 py-6 font-ui text-sm"
              style={{ border: v }}
            >
              <span className="label">{k}</span>
              <span className="font-mono text-xs text-ink-faint">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Principles() {
  return (
    <ol className="grid grid-cols-1 gap-px bg-rule md:grid-cols-2">
      {principles.map((p) => (
        <li
          key={p.n}
          className="bg-canvas-raised p-10"
        >
          <div className="flex items-start justify-between gap-6">
            <span className="chip">Principle 0{p.n}</span>
            <span className="font-display text-chapter leading-none text-ink-faint">0{p.n}</span>
          </div>
          <h3 className="mt-10 font-display text-title">{p.title}</h3>
          <p className="mt-2 label text-ink-muted">{p.kind}</p>
          <p className="mt-6 max-w-md font-ui text-sm leading-relaxed text-ink-muted">{p.body}</p>
        </li>
      ))}
    </ol>
  );
}

function Providers() {
  const toneBg = { red: "bg-rust", green: "bg-pine", blue: "bg-glacier" } as const;
  const toneInk = { red: "text-snow", green: "text-snow", blue: "text-carbon" } as const;
  return (
    <div className="grid grid-cols-1 gap-px bg-rule md:grid-cols-3">
      {providers.map((p) => (
        <div
          key={p.key}
          className={`${toneBg[p.tone]} ${toneInk[p.tone]} flex min-h-56 flex-col justify-between p-10`}
        >
          <span className="label opacity-80">{p.key}</span>
          <h3 className="font-display text-title">{p.label}</h3>
        </div>
      ))}
    </div>
  );
}

function ScorePills() {
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-3">
        {scoreBands.map((b) => (
          <span
            key={b.label}
            className="label inline-flex items-center rounded-pill px-4 py-2"
            style={{ background: b.surface, color: b.ink }}
          >
            {b.label}
          </span>
        ))}
      </div>
      <table className="w-full border-collapse font-ui text-sm">
        <thead>
          <tr className="text-left">
            <th className="label border-b border-rule py-3 pr-4 text-ink-faint">Dimension</th>
            <th className="label border-b border-rule py-3 pr-4 text-ink-faint">Kind</th>
            <th className="label border-b border-rule py-3 text-ink-faint">Token</th>
          </tr>
        </thead>
        <tbody>
          {scoreDimensions.map((d) => (
            <tr key={d.key}>
              <td className="border-b border-rule py-3 pr-4 font-display">{d.label}</td>
              <td className="border-b border-rule py-3 pr-4 text-ink-muted">{d.kind}</td>
              <td className="border-b border-rule py-3 font-mono text-xs text-ink-faint">{d.key}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div>
        <h3 className="label text-ink-muted">Transport</h3>
        <ul className="mt-6 divide-y divide-rule border-y border-rule font-ui">
          {mapLegend.transport.map((t) => (
            <li key={t.key} className="flex items-center gap-6 py-3">
              <span className="label w-20 text-ink-faint">{t.key}</span>
              <span>{t.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="label text-ink-muted">Features</h3>
        <ul className="mt-6 divide-y divide-rule border-y border-rule font-ui">
          {mapLegend.features.map((f) => (
            <li key={f.key} className="flex items-center gap-6 py-3">
              <span className="label w-20 text-ink-faint">{f.key}</span>
              <span>{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Dataviz() {
  const sampleLine = [
    {
      name: "Pine Resort",
      colorIndex: 0,
      data: [
        { x: 2021, y: 62 },
        { x: 2022, y: 68 },
        { x: 2023, y: 71 },
        { x: 2024, y: 77 },
        { x: 2025, y: 84 },
      ],
    },
    {
      name: "Rust Resort",
      colorIndex: 1,
      data: [
        { x: 2021, y: 48 },
        { x: 2022, y: 51 },
        { x: 2023, y: 55 },
        { x: 2024, y: 58 },
        { x: 2025, y: 62 },
      ],
    },
    {
      name: "Glacier Resort",
      colorIndex: 2,
      data: [
        { x: 2021, y: 72 },
        { x: 2022, y: 70 },
        { x: 2023, y: 74 },
        { x: 2024, y: 79 },
        { x: 2025, y: 86 },
      ],
    },
  ];

  const sampleBars = [
    { label: "Cairngorm", value: 84, colorIndex: 0 },
    { label: "Nevis",     value: 76, colorIndex: 1 },
    { label: "Glencoe",   value: 69, colorIndex: 2 },
    { label: "Lecht",     value: 58, colorIndex: 3 },
    { label: "Glenshee",  value: 63, colorIndex: 4 },
  ];

  const radarAxes = [
    "Sustain",
    "Family",
    "Access",
    "Female",
    "Anti-racism",
    "LGBTQ+",
    "Safety",
    "Cost",
  ];
  const radarValues = [4.6, 3.8, 4.2, 4.5, 4.1, 4.3, 4.0, 3.5];

  const quartet = [
    { k: "01", title: "Forms",      body: "Chip-shaped tags carry series names, units and annotations. Everything else stays rectangular." },
    { k: "02", title: "Color",      body: "Use the masterbrand palette first; add the extended series when more than three categories are needed." },
    { k: "03", title: "Labels",     body: "Axis titles in Vollkorn, bracketed with Archivo-Narrow chips for the unit of measure." },
    { k: "04", title: "Foundation", body: "Solid Carbon axis lines, hairline dashed rules for the grid, transparent plot background." },
  ];

  return (
    <div className="space-y-16">
      {/* Hero line chart */}
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="chip">Line</span>
            <span className="micro text-ink-faint">Resort Score · Scotland · 2021 – 2025</span>
          </div>
          <ChartLegend series={sampleLine} />
        </div>
        <div className="border-y border-rule py-10">
          <LineChart
            width={960}
            height={360}
            xDomain={[2021, 2025]}
            yDomain={[40, 100]}
            xLabel="Season"
            yLabel="Resort Score"
            xUnit="YEAR"
            yUnit="/ 100"
            xTicks={[2021, 2022, 2023, 2024, 2025]}
            yTicks={[40, 60, 80, 100]}
            series={sampleLine}
          />
        </div>
      </div>

      {/* Characteristics quartet */}
      <div className="grid grid-cols-1 gap-px bg-rule md:grid-cols-2 lg:grid-cols-4">
        {quartet.map((q) => (
          <div key={q.k} className="bg-canvas-raised p-8">
            <span className="chip">{q.k}</span>
            <h3 className="mt-6 font-display text-section">{q.title}</h3>
            <p className="mt-3 max-w-xs font-ui text-sm leading-relaxed text-ink-muted">
              {q.body}
            </p>
          </div>
        ))}
      </div>

      {/* Secondary chart types — bar + radar */}
      <div className="grid grid-cols-1 gap-px bg-rule md:grid-cols-2">
        <div className="bg-canvas-raised p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="chip">Bar</span>
            <span className="micro text-ink-faint">Resort Score · Top 5</span>
          </div>
          <BarChart bars={sampleBars} yDomain={[0, 100]} />
        </div>
        <div className="bg-canvas-raised p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="chip">Radar</span>
            <span className="micro text-ink-faint">Cairngorm · 8-pillar score</span>
          </div>
          <RadarChart axes={radarAxes} values={radarValues} colorIndex={0} />
        </div>
      </div>

      {/* Types table */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="chip">Catalogue</span>
          <span className="micro text-ink-faint">chart types & when to reach for each</span>
        </div>
        <table className="w-full border-collapse font-ui text-sm">
          <thead>
            <tr>
              <th className="label border-b border-rule py-3 pr-4 text-left text-ink-faint">Type</th>
              <th className="label border-b border-rule py-3 pr-4 text-left text-ink-faint">Token</th>
              <th className="label border-b border-rule py-3 text-left text-ink-faint">Use</th>
            </tr>
          </thead>
          <tbody>
            {dataviz.types.map((t) => (
              <tr key={t.key}>
                <td className="border-b border-rule py-3 pr-4 font-display">{t.label}</td>
                <td className="border-b border-rule py-3 pr-4 font-mono text-xs text-ink-faint">{t.key}</td>
                <td className="border-b border-rule py-3 text-ink-muted">{t.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Series palette */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="chip">Series palette</span>
          <span className="micro text-ink-faint">pick in order; wraps on index 5</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {dataviz.series.map((s, i) => (
            <span
              key={s.key}
              className="chip"
              style={{ borderColor: s.stroke, color: "var(--ink)" }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: s.stroke }}
              />
              {s.key} · {String(i).padStart(2, "0")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-rule bg-canvas px-6 py-12 md:px-10 md:py-16 lg:px-14 lg:py-20">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <Image
            src="/brand/logotype/logotype_green.png"
            alt="Oütlas"
            width={2213}
            height={478}
            className="h-8 w-auto dark:hidden"
          />
          <Image
            src="/brand/logotype/logotype_white.png"
            alt="Oütlas"
            width={2213}
            height={478}
            className="hidden h-8 w-auto dark:block"
          />
          <p className="mt-6 max-w-md font-ui text-sm text-ink-muted">
            Tokens live in <code className="font-mono text-xs">app/lib/design-system.ts</code>. CSS
            variables live in <code className="font-mono text-xs">app/globals.css</code>. Keep them
            in sync.
          </p>
        </div>
        <div className="font-ui text-xs text-ink-faint md:text-right">
          <div>Brand by Tom Lenartowicz / Thrilly, March 2020.</div>
          <div>System v2 by HUX, {new Date().getFullYear()}.</div>
          <div className="mt-6">{String(CHAPTERS.length).padStart(2, "0")} chapters</div>
        </div>
      </div>
    </footer>
  );
}
