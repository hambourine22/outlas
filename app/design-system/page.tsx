import Image from "next/image";
import {
  colors,
  surfaces,
  typography,
  radii,
  shadows,
  spacing,
  providers,
  scoreDimensions,
  scoreBands,
  mapLegend,
  principles,
  voice,
} from "@/app/lib/design-system";

export const metadata = {
  title: "Oütlas — Design System",
  description:
    "Living reference for Oütlas brand tokens, type, surfaces, and UX patterns.",
};

const colorOrder = ["sand", "carbon", "snow", "rust", "pine", "glacier"] as const;
const surfaceOrder = ["rental", "repair", "story", "manifest", "default"] as const;

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-snow text-carbon">
      <Masthead />
      <Section
        eyebrow="01"
        title="Voice"
        intro="Three lines, read in order. The manifesto expands the ladder; the tagline compresses it."
      >
        <Voice />
      </Section>

      <Section
        eyebrow="02"
        title="Logo"
        intro="Ü logomark is the signature; the wordmark anchors long-form surfaces. One colour per surface — never recolour outside the palette."
      >
        <Logos />
      </Section>

      <Section
        eyebrow="03"
        title="Palette"
        intro="Six brand colours with named roles. Every value exists in the token file; nothing is picked by eye."
      >
        <Palette />
      </Section>

      <Section
        eyebrow="04"
        title="Surfaces"
        intro="Each UX moment binds to a surface via data-surface. CSS variables carry background, accent and ink down the tree."
      >
        <Surfaces />
      </Section>

      <Section
        eyebrow="05"
        title="Type"
        intro="Vollkorn for editorial display and body — it carries the storytelling. Archivo Narrow for UI labels, meta, and navigation chrome."
      >
        <TypeScale />
      </Section>

      <Section
        eyebrow="06"
        title="Spacing, radii & shadow"
        intro="One ladder each. New components reach for an existing rung before adding a new one."
      >
        <SpaceRadiiShadow />
      </Section>

      <Section
        eyebrow="07"
        title="Principles"
        intro="Four load-bearing rules behind every surface."
      >
        <Principles />
      </Section>

      <Section
        eyebrow="08"
        title="Providers"
        intro="The three-circle taxonomy. Every supplier maps to exactly one; service-provider gets the Ü mark."
      >
        <Providers />
      </Section>

      <Section
        eyebrow="09"
        title="Score pills"
        intro="Resort pillars are rendered as pills — a 0–5 band drives colour; the number is secondary."
      >
        <ScorePills />
      </Section>

      <Section
        eyebrow="10"
        title="Map legend"
        intro="Shared across the Scotland map and every regional map that follows."
      >
        <MapLegend />
      </Section>

      <Footer />
    </main>
  );
}

/* ---------- primitives ---------- */

function Section({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-carbon/10 px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex items-baseline gap-4">
            <span className="label text-carbon/60">{eyebrow}</span>
            <h2 className="font-display text-title md:text-display-2">{title}</h2>
          </div>
          <p className="max-w-xl font-ui text-sm text-carbon/70">{intro}</p>
        </header>
        {children}
      </div>
    </section>
  );
}

/* ---------- masthead ---------- */

function Masthead() {
  return (
    <header
      data-surface="manifest"
      className="relative overflow-hidden"
      style={{ background: "var(--surface)", color: "var(--ink)" }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-24 pt-20 md:grid-cols-12 md:px-12 md:pb-32 md:pt-28 lg:px-20">
        <div className="md:col-span-7">
          <span className="label">Oütlas v1.3 — Design System</span>
          <h1 className="mt-6 font-display text-display-1 leading-[1.02]">
            Share gear.
            <br />
            Buy less.
            <br />
            Ride more.
          </h1>
          <p className="mt-8 max-w-xl font-ui text-base leading-relaxed">
            {voice.manifesto}
          </p>
        </div>
        <aside className="flex items-start justify-end md:col-span-5">
          <Image
            src="/brand/mark/U_green.png"
            alt="Oütlas Ü logomark"
            width={220}
            height={220}
            priority
            className="h-40 w-40 md:h-56 md:w-56"
          />
        </aside>
      </div>
    </header>
  );
}

/* ---------- sections ---------- */

function Voice() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {voice.ladder.map((line, i) => (
        <div
          key={line}
          className="rounded-card border border-carbon/10 bg-snow p-8 shadow-resting"
        >
          <span className="label text-carbon/50">0{i + 1}</span>
          <p className="mt-4 font-display text-title">{line}</p>
        </div>
      ))}
    </div>
  );
}

function Logos() {
  const lockups: { color: string; bg: string; invert: boolean }[] = [
    { color: "green",  bg: "bg-snow",    invert: false },
    { color: "yellow", bg: "bg-pine",    invert: true  },
    { color: "red",    bg: "bg-sand",    invert: false },
    { color: "white",  bg: "bg-carbon",  invert: true  },
    { color: "black",  bg: "bg-glacier", invert: false },
    { color: "blue",   bg: "bg-carbon",  invert: true  },
  ];
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {lockups.map((l) => (
          <div
            key={l.color}
            className={`${l.bg} flex items-center justify-center rounded-card p-10`}
          >
            <Image
              src={`/brand/mark/U_${l.color}.png`}
              alt={`Ü mark, ${l.color}`}
              width={120}
              height={120}
              className="h-24 w-24 object-contain"
            />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {lockups.map((l) => (
          <div
            key={`wm-${l.color}`}
            className={`${l.bg} flex items-center justify-center rounded-card p-10`}
          >
            <Image
              src={`/brand/logotype/logotype_${l.color}.png`}
              alt={`Oütlas wordmark, ${l.color}`}
              width={240}
              height={64}
              className="h-10 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Palette() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {colorOrder.map((key) => {
        const c = colors[key];
        return (
          <article
            key={key}
            className="overflow-hidden rounded-card border border-carbon/10 shadow-resting"
          >
            <div className="h-32" style={{ background: c.hex }} />
            <div className="space-y-3 bg-snow p-5 font-ui">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-section">{c.name}</h3>
                <span className="label text-carbon/50">{key}</span>
              </div>
              <dl className="grid grid-cols-[64px_1fr] gap-y-1 text-sm text-carbon/80">
                <dt className="label text-carbon/50">HEX</dt>
                <dd className="font-mono">{c.hex}</dd>
                <dt className="label text-carbon/50">RGB</dt>
                <dd className="font-mono">{c.rgb}</dd>
                <dt className="label text-carbon/50">CMYK</dt>
                <dd className="font-mono">{c.cmyk}</dd>
              </dl>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Surfaces() {
  return (
    <div className="grid gap-6 lg:grid-cols-5 md:grid-cols-2 sm:grid-cols-1">
      {surfaceOrder.map((key) => {
        const s = surfaces[key];
        return (
          <div
            key={key}
            data-surface={key === "default" ? undefined : key}
            className="flex min-h-56 flex-col justify-between rounded-card p-6 shadow-resting"
            style={{ background: "var(--surface)", color: "var(--ink)" }}
          >
            <div>
              <span className="label" style={{ color: "var(--accent)" }}>
                data-surface
              </span>
              <h3 className="mt-2 font-display text-title">{key}</h3>
            </div>
            <div className="font-ui text-xs">
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
  const rows: { token: keyof typeof typography.scale; sample: string; family: "display" | "ui" }[] = [
    { token: "display1", sample: "Share gear.", family: "display" },
    { token: "display2", sample: "We connect riders to low carbon methods.", family: "display" },
    { token: "title",    sample: "Ski Touring & Risk Space", family: "display" },
    { token: "section",  sample: "Resort Score", family: "display" },
    { token: "body",     sample: "Cairn Gorm is a mountain and listed Munro in the Scottish Highlands.", family: "display" },
    { token: "label",    sample: "Join the movement", family: "ui" },
    { token: "micro",    sample: "Rental • GB", family: "ui" },
  ];
  return (
    <div className="divide-y divide-carbon/10 overflow-hidden rounded-card border border-carbon/10 bg-snow">
      {rows.map((r) => {
        const t = typography.scale[r.token];
        return (
          <div key={r.token} className="grid gap-4 p-5 md:grid-cols-[180px_1fr]">
            <div className="font-ui text-xs text-carbon/60">
              <div className="label text-carbon">{r.token}</div>
              <div className="mt-2 font-mono">{t.size}</div>
              <div className="font-mono">lh {t.line}</div>
              {"tracking" in t ? <div className="font-mono">tr {t.tracking}</div> : null}
            </div>
            <div
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

function SpaceRadiiShadow() {
  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div>
        <h3 className="label text-carbon/60">Spacing</h3>
        <ul className="mt-4 space-y-2 font-ui text-sm">
          {Object.entries(spacing).map(([k, v]) => (
            <li key={k} className="flex items-center gap-4">
              <span className="w-10 font-mono text-carbon/50">{k}</span>
              <span className="h-3 rounded-sm bg-pine/80" style={{ width: v }} />
              <span className="font-mono text-xs text-carbon/60">{v}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="label text-carbon/60">Radii</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {Object.entries(radii).map(([k, v]) => (
            <div key={k} className="flex flex-col items-center gap-2 font-ui text-xs">
              <div
                className="h-20 w-20 bg-sand"
                style={{ borderRadius: v }}
              />
              <div className="font-mono">{k}</div>
              <div className="text-carbon/50">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="label text-carbon/60">Shadow</h3>
        <div className="mt-4 space-y-4">
          {Object.entries(shadows).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between rounded-card bg-snow px-4 py-6 font-ui text-sm"
              style={{ boxShadow: v }}
            >
              <span className="label">{k}</span>
              <span className="font-mono text-xs text-carbon/60">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Principles() {
  return (
    <ol className="grid gap-6 md:grid-cols-2">
      {principles.map((p) => (
        <li
          key={p.n}
          className="rounded-card border border-carbon/10 bg-snow p-8 shadow-resting"
        >
          <div className="flex items-center justify-between">
            <span className="label text-carbon/50">
              Principle {p.n} — {p.kind}
            </span>
            <span className="font-display text-section text-carbon/30">0{p.n}</span>
          </div>
          <h3 className="mt-4 font-display text-title">{p.title}</h3>
          <p className="mt-3 font-ui text-sm text-carbon/70">{p.body}</p>
        </li>
      ))}
    </ol>
  );
}

function Providers() {
  const toneBg = { red: "bg-rust", green: "bg-pine", blue: "bg-glacier" } as const;
  const toneInk = { red: "text-snow", green: "text-snow", blue: "text-carbon" } as const;
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {providers.map((p) => (
        <div
          key={p.key}
          className={`${toneBg[p.tone]} ${toneInk[p.tone]} flex flex-col gap-6 rounded-card p-8`}
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
    <div className="space-y-6">
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
          <tr className="text-left label text-carbon/50">
            <th className="border-b border-carbon/10 py-3 pr-4">Dimension</th>
            <th className="border-b border-carbon/10 py-3 pr-4">Kind</th>
            <th className="border-b border-carbon/10 py-3">Token</th>
          </tr>
        </thead>
        <tbody>
          {scoreDimensions.map((d) => (
            <tr key={d.key}>
              <td className="border-b border-carbon/5 py-3 pr-4 font-display">{d.label}</td>
              <td className="border-b border-carbon/5 py-3 pr-4 text-carbon/60">{d.kind}</td>
              <td className="border-b border-carbon/5 py-3 font-mono text-xs text-carbon/50">{d.key}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <h3 className="label text-carbon/60">Transport</h3>
        <ul className="mt-4 space-y-2 font-ui">
          {mapLegend.transport.map((t) => (
            <li key={t.key} className="flex items-center gap-3 border-b border-carbon/5 py-2">
              <span className="label w-20 text-carbon/50">{t.key}</span>
              <span>{t.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="label text-carbon/60">Features</h3>
        <ul className="mt-4 space-y-2 font-ui">
          {mapLegend.features.map((f) => (
            <li key={f.key} className="flex items-center gap-3 border-b border-carbon/5 py-2">
              <span className="label w-20 text-carbon/50">{f.key}</span>
              <span>{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer
      data-surface="carbon"
      className="px-6 py-16 md:px-12 lg:px-20"
      style={{ background: "var(--surface)", color: "var(--ink)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Image
            src="/brand/logotype/logotype_yellow.png"
            alt="Oütlas"
            width={200}
            height={56}
            className="h-10 w-auto"
          />
          <p className="mt-6 max-w-md font-ui text-sm opacity-80">
            Tokens live in <code className="font-mono">app/lib/design-system.ts</code>. CSS variables
            live in <code className="font-mono">app/globals.css</code>. Keep them in sync.
          </p>
        </div>
        <div className="font-ui text-xs opacity-70">
          <div>Brand by Tom Lenartowicz / Thrilly, March 2020.</div>
          <div>System build by HUX, {new Date().getFullYear()}.</div>
        </div>
      </div>
    </footer>
  );
}
