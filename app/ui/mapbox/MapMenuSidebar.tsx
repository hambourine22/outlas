"use client";

import { useState } from "react";
import {
  CATEGORY_COLOUR,
  CATEGORY_LABEL,
  type MapCategory,
} from "@/app/content/map/types";
import { REGIONS, regionByKey, type RegionKey } from "@/app/content/map/regions";
import {
  TRANSPORT_LABEL,
  TRANSPORT_NOTE,
  TRANSPORT_COUNTS,
  type TransportKind,
} from "@/app/content/map/transport";
import { mapTransport } from "@/app/lib/design-system";
import { TrainStation, ChargePoint } from "@/app/ui/icons/TransportIcons";

// Overlay-mode map menu sidebar — the left rail on the map route. Follows
// the HUX Phase 1+2 architecture captured in docs/MAP_MENU_ARCHITECTURE.md,
// amended 2026-10-31 (regions-current-card brief): Regions is primary
// context, not a future group, so it leads the panel as a full-width card.
//
//   MAP SYMBOLS                  (sidebar name)
//   ──────────────
//   REGION
//   All of Scotland              (eyebrow + h3 — current region)
//   ──────────────
//   PROVIDERS   ▾                (live data — pin key + filter, dual-purpose)
//   ├── FEATURES    ▸            (future — "coming" state)
//   └── TRANSPORT   ▾            (live data — plate key + filter)
//   ──────────────
//     5 of 16 pins visible       (view summary — live count, transport included)
//     Hide/Show all              (quick toggle, transport included)
//
// The pin key is NOT a separate overlay anywhere on the map. Every colour
// the map uses is labelled on an active row here. Legacy MapLegend retired.

export type MapFilters = Record<MapCategory, boolean>;
export type TransportFilters = Record<TransportKind, boolean>;

type Props = {
  filters: MapFilters;
  counts: Record<MapCategory, number>;
  onToggle: (category: MapCategory) => void;
  onToggleAll: (visible: boolean) => void;
  transport: TransportFilters;
  onToggleTransport: (kind: TransportKind) => void;
  activeRegion: RegionKey;
  onSelectRegion: (region: RegionKey) => void;
};

const CATEGORY_ORDER: MapCategory[] = ["resorts", "rentals", "repairs", "guides"];
const TRANSPORT_ORDER: TransportKind[] = ["station", "charge"];
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
];


export default function MapMenuSidebar({
  filters,
  counts,
  onToggle,
  onToggleAll,
  transport,
  onToggleTransport,
  activeRegion,
  onSelectRegion,
}: Props) {
  const [open, setOpen] = useState(true);
  const allOn =
    CATEGORY_ORDER.every((c) => filters[c]) &&
    TRANSPORT_ORDER.every((k) => transport[k]);
  const totalPins =
    CATEGORY_ORDER.reduce((n, c) => n + counts[c], 0) +
    TRANSPORT_ORDER.reduce((n, k) => n + TRANSPORT_COUNTS[k], 0);
  const visiblePins =
    CATEGORY_ORDER.reduce((n, c) => n + (filters[c] ? counts[c] : 0), 0) +
    TRANSPORT_ORDER.reduce((n, k) => n + (transport[k] ? TRANSPORT_COUNTS[k] : 0), 0);

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
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: CATEGORY_COLOUR[c],
                  opacity: filters[c] ? 1 : 0.3,
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
        {/* Current region + region picker — full-width card leads the
            panel. The question "where am I viewing?" is the single most
            useful piece of context, so it reads before any filter row.
            Each row flies the map camera to that region's preset. */}
        <RegionSection active={activeRegion} onSelect={onSelectRegion} />

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

        {/* Live layer — Transport. Each row is the plate the map draws
            plus a filter, same dual purpose as the Providers rows. */}
        <TransportSection transport={transport} onToggle={onToggleTransport} />

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

/* -------------------------------------------------------------------------
 * RegionSection — full-width card at the top of the open panel body.
 * Shows the current region as an eyebrow + Vollkorn h3 + one-line Nikolai
 * context, then a list of region rows below. Each row flies the camera
 * to that region's preset (centre + zoom) via onSelect.
 * ---------------------------------------------------------------------- */
function RegionSection({
  active,
  onSelect,
}: {
  active: RegionKey;
  onSelect: (key: RegionKey) => void;
}) {
  const current = regionByKey(active);
  return (
    <section aria-label="Region" className="border-b border-rule">
      <div className="px-4 pb-4 pt-5">
        <p className="label text-ink-faint">Region</p>
        <h3 className="mt-1.5 font-serif text-title leading-tight text-ink">
          {current.label}
        </h3>
        <p className="mt-2 font-ui text-xs leading-relaxed text-ink-muted">
          {current.oneLine}
        </p>
      </div>
      <ul className="border-t border-rule/60 pb-2 pt-1" aria-label="Region list">
        {REGIONS.map((r) => (
          <RegionRow
            key={r.key}
            label={r.label}
            active={r.key === active}
            onSelect={() => onSelect(r.key)}
          />
        ))}
      </ul>
    </section>
  );
}

function RegionRow({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        aria-current={active ? "true" : undefined}
        className={[
          "flex w-full items-center justify-between px-4 py-2 text-left font-ui text-sm transition-colors",
          active
            ? "bg-[var(--row-active)] text-ink"
            : "text-ink-muted hover:bg-[var(--row-hover)] hover:text-ink",
        ].join(" ")}
      >
        <span>{label}</span>
        {active && (
          <span
            aria-hidden
            className="font-mono text-[10px] uppercase tracking-wide text-ink-faint"
          >
            viewing
          </span>
        )}
      </button>
    </li>
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
          className="inline-block h-3 w-3 shrink-0 rounded-full transition-opacity"
          style={{
            backgroundColor: CATEGORY_COLOUR[category],
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

/* -------------------------------------------------------------------------
 * TransportSection — collapsible, same header language as ProviderGroup.
 * Expanded, one row per transport kind: the square plate the map draws
 * (carbon plate, snow glyph, from mapTransport), label, count and palette
 * note. Each row toggles its kind on the map, like a ProviderRow.
 * ---------------------------------------------------------------------- */
const TRANSPORT_ICON: Record<TransportKind, typeof TrainStation> = {
  station: TrainStation,
  charge: ChargePoint,
};

function TransportSection({
  transport,
  onToggle,
}: {
  transport: TransportFilters;
  onToggle: (kind: TransportKind) => void;
}) {
  const [open, setOpen] = useState(true);
  const panelId = "map-menu-group-transport";
  return (
    <section className="border-t border-rule/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="label flex w-full items-center justify-between px-4 py-3 text-ink-faint transition-colors hover:bg-[var(--row-hover)] hover:text-ink"
      >
        <span>Transport</span>
        <ChevronDown open={open} />
      </button>
      {open && (
        <div id={panelId} className="pb-2">
          <p className="px-4 pb-2 font-ui text-xs leading-relaxed text-ink-muted">
            ScotRail stations and ChargePlace Scotland points near the five
            Scottish resorts. They show once you zoom to Scotland. Positions
            are approximate, so check the operator before you rely on one.
          </p>
          <ul>
            {TRANSPORT_ORDER.map((kind) => (
              <TransportRow
                key={kind}
                kind={kind}
                active={transport[kind]}
                onToggle={() => onToggle(kind)}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function TransportRow({
  kind,
  active,
  onToggle,
}: {
  kind: TransportKind;
  active: boolean;
  onToggle: () => void;
}) {
  const Icon = TRANSPORT_ICON[kind];
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
          className="flex h-4 w-4 shrink-0 items-center justify-center transition-opacity"
          style={{
            backgroundColor: mapTransport.plate,
            color: mapTransport.glyph,
            opacity: active ? 1 : 0.25,
          }}
        >
          <Icon size={11} />
        </span>
        <span className={["whitespace-nowrap", active ? "" : "line-through decoration-ink/40"].join(" ")}>
          {TRANSPORT_LABEL[kind]}
        </span>
        <span className="ml-auto flex items-center gap-2 whitespace-nowrap">
          <span className="font-mono text-xs text-ink-faint">{TRANSPORT_COUNTS[kind]}</span>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            · {TRANSPORT_NOTE[kind]}
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
