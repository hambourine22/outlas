"use client";

import { useState } from "react";
import {
  CATEGORY_COLOUR,
  CATEGORY_RING,
  CATEGORY_LABEL,
  type MapCategory,
} from "@/app/content/map/types";

// Overlay-mode map menu sidebar — the left rail on the map route. Follows
// the HUX Phase 1+2 architecture captured in docs/MAP_MENU_ARCHITECTURE.md:
//
//   MAP SYMBOLS            (sidebar name)
//   ├── PROVIDERS   ▾      (live data — pin key + filter, dual-purpose)
//   ├── FEATURES    ▸      (future — "coming" state)
//   ├── TRANSPORT   ▸      (future — "coming" state)
//   └── REGIONS     ▸      (future — "shown by default" state)
//   ──────────────
//     5 of 16 pins visible      (view summary — live count)
//     Hide/Show all             (quick toggle)
//
// The pin key is NOT a separate overlay anywhere on the map. Every colour
// the map uses is labelled on an active row here. Legacy MapLegend retired.

export type MapFilters = Record<MapCategory, boolean>;

type Props = {
  filters: MapFilters;
  counts: Record<MapCategory, number>;
  onToggle: (category: MapCategory) => void;
  onToggleAll: (visible: boolean) => void;
};

const CATEGORY_ORDER: MapCategory[] = ["resorts", "rentals", "repairs", "guides"];
const CATEGORY_NOTE: Record<MapCategory, string> = {
  resorts: "pine",
  rentals: "glacier",
  repairs: "rust",
  guides: "sand",
};

// Future groups — architecture-level stubs that read as planned, not
// unfinished. Each shows a label-caps "coming" chip beside its chevron and,
// when expanded, a single brand-voice line explaining what will land there.
type FutureGroup = {
  key: "features" | "transport" | "regions";
  label: string;
  hint: string;
  body: string;
};
const FUTURE_GROUPS: FutureGroup[] = [
  {
    key: "features",
    label: "Features",
    hint: "✦ Winter 25/26",
    body: "Ski, hike, bike trails and more — stitched in as data lands.",
  },
  {
    key: "transport",
    label: "Transport",
    hint: "✦ Spring 26",
    body: "EV charge points, trains and sail routes — the lines connecting the dots.",
  },
  {
    key: "regions",
    label: "Regions",
    hint: "All of Scotland",
    body: "Highlands, Cairngorms, Trossachs, Borders, Islands — filter the map by region.",
  },
];

export default function MapMenuSidebar({ filters, counts, onToggle, onToggleAll }: Props) {
  const [open, setOpen] = useState(true);
  const allOn = CATEGORY_ORDER.every((c) => filters[c]);
  const totalPins = CATEGORY_ORDER.reduce((n, c) => n + counts[c], 0);
  const visiblePins = CATEGORY_ORDER.reduce(
    (n, c) => n + (filters[c] ? counts[c] : 0),
    0,
  );

  if (!open) {
    return (
      <aside
        aria-label="Map filters (collapsed)"
        className="pointer-events-auto absolute left-3 top-3 z-20 md:left-4 md:top-4"
      >
        <div className="flex flex-col items-center gap-2 border border-rule bg-canvas p-2 shadow-sm">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open map filters"
            className="flex h-8 w-8 items-center justify-center text-ink transition-colors hover:bg-[var(--row-hover)]"
          >
            <ChevronRight />
          </button>
          {/* Pip legend — four colour pips still read as the key when collapsed */}
          <ul className="flex flex-col items-center gap-1.5 py-1" aria-label="Pin key">
            {CATEGORY_ORDER.map((c) => (
              <li
                key={c}
                className="h-2.5 w-2.5 rounded-full border-2"
                style={{
                  backgroundColor: filters[c] ? CATEGORY_COLOUR[c] : "transparent",
                  borderColor: CATEGORY_RING[c],
                  opacity: filters[c] ? 1 : 0.5,
                }}
                title={CATEGORY_LABEL[c]}
                aria-label={`${CATEGORY_LABEL[c]} ${filters[c] ? "visible" : "hidden"}`}
              />
            ))}
          </ul>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Map symbols"
      className="pointer-events-auto absolute left-3 top-3 z-20 flex max-h-[calc(100%-1.5rem)] w-72 flex-col border border-rule bg-canvas shadow-sm md:left-4 md:top-4 md:max-h-[calc(100%-2rem)]"
    >
      {/* Header — sidebar name, chevron collapses to the pip rail */}
      <header className="flex items-center justify-between border-b border-rule px-4 py-3">
        <span className="label text-ink-faint">Map symbols</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Collapse map symbols"
          className="flex h-7 w-7 items-center justify-center text-ink-muted transition-colors hover:bg-[var(--row-hover)] hover:text-ink"
        >
          <ChevronLeft />
        </button>
      </header>

      <div className="overflow-y-auto">
        {/* Live layer — Providers */}
        <ProviderGroup
          categories={CATEGORY_ORDER}
          filters={filters}
          counts={counts}
          onToggle={onToggle}
        />

        {/* Planned layers — expand to show the brand-voice "coming" line.
            No fake toggles; the taxonomy is intact, the state is honest. */}
        {FUTURE_GROUPS.map((g) => (
          <FutureGroupSection key={g.key} group={g} />
        ))}

        {/* Footer stack — view summary + utility actions */}
        <footer className="border-t border-rule px-4 py-3">
          <ViewSummary visible={visiblePins} total={totalPins} onShowAll={() => onToggleAll(true)} />
          <button
            type="button"
            onClick={() => onToggleAll(!allOn)}
            className="mt-3 block font-ui text-xs text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            {allOn ? "Hide all pins" : "Show all pins"}
          </button>
          <span
            className="mt-2 block font-mono text-[10px] uppercase tracking-wide text-ink-faint"
            aria-hidden
          >
            ✦ Save this view — coming
          </span>
        </footer>
      </div>
    </aside>
  );
}

function ProviderGroup({
  categories,
  filters,
  counts,
  onToggle,
}: {
  categories: MapCategory[];
  filters: MapFilters;
  counts: Record<MapCategory, number>;
  onToggle: (c: MapCategory) => void;
}) {
  const [open, setOpen] = useState(true);
  const panelId = "map-menu-group-providers";
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="label flex w-full items-center justify-between px-4 py-3 text-ink-faint transition-colors hover:bg-[var(--row-hover)] hover:text-ink"
      >
        <span>Providers</span>
        <ChevronDown open={open} />
      </button>
      {open && (
        <ul id={panelId} className="pb-2">
          {categories.map((c) => (
            <ProviderRow
              key={c}
              category={c}
              active={filters[c]}
              count={counts[c]}
              onToggle={() => onToggle(c)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ProviderRow({
  category,
  active,
  count,
  onToggle,
}: {
  category: MapCategory;
  active: boolean;
  count: number;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        className={[
          "flex w-full items-center gap-3 px-4 py-2 text-left font-ui text-sm transition-colors",
          active
            ? "text-ink hover:bg-[var(--row-hover)]"
            : "text-ink-faint hover:bg-[var(--row-hover)] hover:text-ink-muted",
        ].join(" ")}
      >
        <span
          aria-hidden
          className="inline-block h-3 w-3 shrink-0 rounded-full border-2 transition-opacity"
          style={{
            backgroundColor: CATEGORY_COLOUR[category],
            borderColor: CATEGORY_RING[category],
            opacity: active ? 1 : 0.25,
          }}
        />
        <span className={active ? "" : "line-through decoration-ink/40"}>
          {CATEGORY_LABEL[category]}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span className="font-mono text-xs text-ink-faint">{count}</span>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            · {CATEGORY_NOTE[category]}
          </span>
        </span>
      </button>
    </li>
  );
}

function FutureGroupSection({ group }: { group: FutureGroup }) {
  const [open, setOpen] = useState(false);
  const panelId = `map-menu-group-${group.key}`;
  return (
    <section className="border-t border-rule/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="label flex w-full items-center justify-between px-4 py-3 text-ink-faint transition-colors hover:bg-[var(--row-hover)] hover:text-ink"
      >
        <span>{group.label}</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            {group.hint}
          </span>
          <ChevronDown open={open} />
        </span>
      </button>
      {open && (
        <div id={panelId} className="px-4 pb-4">
          <p className="font-ui text-xs leading-relaxed text-ink-muted">{group.body}</p>
        </div>
      )}
    </section>
  );
}

function ViewSummary({
  visible,
  total,
  onShowAll,
}: {
  visible: number;
  total: number;
  onShowAll: () => void;
}) {
  if (visible === 0) {
    return (
      <p className="font-ui text-xs leading-relaxed text-ink-muted">
        Nothing to show.{" "}
        <button
          type="button"
          onClick={onShowAll}
          className="font-ui text-ink underline-offset-4 hover:underline"
        >
          Flip at least one layer back on.
        </button>
      </p>
    );
  }
  return (
    <p className="font-ui text-xs text-ink-muted">
      <span className="text-ink">{visible}</span>
      {" of "}
      <span className="text-ink">{total}</span>
      {" pins visible"}
    </p>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={[
        "shrink-0 transition-transform duration-150",
        open ? "rotate-180" : "rotate-0",
      ].join(" ")}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
