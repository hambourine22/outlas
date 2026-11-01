"use client";

import Image from "next/image";
import type {
  Resorts,
  Rentals,
  Repairs,
  OperationalStatus,
} from "@/app/definitions/mapboxDefinitions";
import type { Guides } from "@/app/content/map/types";
import { ResortAnatomy } from "@/app/ui/ResortAnatomy";
import {
  CATEGORY_COLOUR,
  CATEGORY_LABEL,
  ACTIVITY_LABEL,
  type Activity,
  type MapCategory,
} from "@/app/content/map/types";

// Right-rail pin preview. Opens when a map pin is clicked. The content it
// receives is shape-aware — resorts, rentals, repairs and guides each have
// different field sets, so this component unifies them into one summary
// before rendering. Design tokens, hairline rules and the display-2 heading
// mirror the Story page components so the two surfaces read as one system.
//
// For resorts specifically this panel also renders three new primitives
// defined below (StatusBadge, SeasonBar, ActivityChips) per the spec at
// docs/specs/world-mountain-resorts.md.

export type PreviewContent = Resorts | Rentals | Repairs | Guides;

type Props = {
  show: boolean;
  category: MapCategory | null;
  content: PreviewContent | undefined;
  onClose: () => void;
};

export default function MapPreviewSidebar({ show, category, content, onClose }: Props) {
  const summary = content && category ? summarise(content, category) : null;
  const isResort = summary?.category === "resorts";
  const resort = isResort && content ? (content as Resorts) : null;
  const status = resort ? deriveStatus(resort) : null;

  return (
    <>
      {/* Backdrop — mobile only, so the map stays visible on desktop */}
      <div
        onClick={onClose}
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 z-20 bg-ink/40 backdrop-blur-sm transition-opacity md:hidden",
          show ? "pointer-events-auto opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <aside
        aria-label="Location details"
        aria-hidden={!show}
        className={[
          "absolute inset-y-0 right-0 z-30 flex w-full max-w-md flex-col overflow-y-auto border-l border-rule bg-canvas shadow-lg",
          "transition-transform duration-200 ease-out",
          show ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close location details"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-canvas/90 text-ink shadow-sm backdrop-blur-sm transition-colors hover:bg-[var(--row-hover)]"
        >
          <CloseIcon />
        </button>

        {summary ? (
          <>
            {/* Hero — 16:9 figure with a tinted fallback when none */}
            <div className="relative aspect-[16/9] w-full border-b border-rule bg-canvas-raised">
              {summary.hero ? (
                <Image
                  src={summary.hero}
                  alt={summary.title}
                  fill
                  sizes="(min-width: 768px) 28rem, 100vw"
                  className="object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="flex h-full w-full items-center justify-center"
                  style={{ backgroundColor: CATEGORY_COLOUR[summary.category] + "33" }}
                >
                  <span
                    className="inline-block h-6 w-6 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLOUR[summary.category] }}
                  />
                </div>
              )}
            </div>

            {/* Title + place + status badge */}
            <div className="px-6 pt-6">
              <h2
                className={[
                  "font-display text-display-2 leading-tight text-ink",
                  status === "closed" ? "line-through decoration-ink/40" : "",
                ].join(" ")}
              >
                {summary.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="label text-ink-faint">{summary.place}</span>
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLOUR[summary.category] }}
                />
                <span className="label text-ink-faint">{CATEGORY_LABEL[summary.category]}</span>
                {status && (
                  <span className="ml-auto">
                    <StatusBadge status={status} />
                  </span>
                )}
              </div>
            </div>

            <div className="mx-6 mt-4 border-t border-rule" />

            {/* Resort-only block: season bar + activities (both omit when empty) */}
            {resort && (
              <ResortMeta resort={resort} status={status} />
            )}

            {/* Body */}
            {summary.body && (
              <div className="px-6 pt-5">
                <p className="font-ui text-sm leading-relaxed text-ink-muted">
                  {summary.body}
                </p>
              </div>
            )}

            {/* Learn more */}
            {summary.href && (
              <div className="px-6 pt-5">
                <a
                  href={summary.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-ui text-sm text-ink underline-offset-4 hover:underline"
                >
                  Learn more
                  <ArrowOutIcon />
                </a>
              </div>
            )}

            <div className="mx-6 mt-6 border-t border-rule" />

            {/* Details */}
            {summary.details.length > 0 && (
              <dl className="px-6 pb-8 pt-5">
                <dt className="label text-ink-faint">Details</dt>
                <div className="mt-3 space-y-3">
                  {summary.details.map((d) => (
                    <div
                      key={d.label}
                      className="flex items-baseline justify-between gap-6 border-b border-rule/60 pb-3 last:border-b-0 last:pb-0"
                    >
                      <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                        {d.label}
                      </dt>
                      <dd className="text-right font-ui text-sm text-ink">
                        {d.href ? (
                          <a
                            href={d.href}
                            target="_blank"
                            rel="noreferrer"
                            className="underline-offset-4 hover:underline"
                          >
                            {d.value}
                          </a>
                        ) : (
                          d.value
                        )}
                      </dd>
                    </div>
                  ))}
                </div>
              </dl>
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <span className="label text-ink-faint">Nothing to show</span>
          </div>
        )}
      </aside>
    </>
  );
}

/* ================================================================
 * Resort meta — composes StatStrip + SeasonBar + ActivityChips.
 * Each sub-block omits itself when it has no data; the whole wrapper
 * omits when none of them have anything.
 * ================================================================ */
function ResortMeta({
  resort,
  status,
}: {
  resort: Resorts;
  status: ResortStatus | null;
}) {
  const stats = statsFor(resort);
  const hasStats = stats.length > 0;
  const hasSeason =
    resort.operational_status === "seasonal" &&
    !!resort.season_from &&
    !!resort.season_to;
  const hasActivities = Array.isArray(resort.activities) && resort.activities.length > 0;
  // The anatomy glyph needs the mountain trio; a snowdome or a cable park
  // keeps the strip and waits for its own form.
  const hasMountain =
    typeof resort.peak_m === "number" &&
    typeof resort.vertical_m === "number" &&
    typeof resort.terrain_km === "number";
  if (!hasStats && !hasSeason && !hasActivities) return null;

  return (
    <div className="px-6 pt-5">
      {hasMountain && (
        <div className="mb-5">
          <ResortAnatomy
            kind="mountain"
            aspect="square"
            scale="fit"
            readouts={false}
            name={resort.name}
            stats={{
              peak: resort.peak_m as number,
              base: Math.max(0, (resort.peak_m as number) - (resort.vertical_m as number)),
              terrain: resort.terrain_km as number,
              lifts: resort.lifts ?? 0,
              snowfall: resort.snowfall_cm,
            }}
          />
        </div>
      )}
      {hasStats && <StatStrip stats={stats} />}
      {hasSeason && (
        <div className={hasStats ? "mt-5" : ""}>
          <SeasonBar
            from={resort.season_from!}
            to={resort.season_to!}
            dim={status === "out-of-season"}
          />
        </div>
      )}
      {hasActivities && (
        <div className={hasStats || hasSeason ? "mt-5" : ""}>
          <ActivityChips activities={resort.activities} max={6} />
        </div>
      )}
    </div>
  );
}

/* ================================================================
 * StatStrip — top-5 statistics per resort-stats-pack spec. A row of
 * equal cells with hairline dividers between them. Each cell shows
 * a label (micro caps) above a formatted value in font-mono. Missing
 * stats omit their cell silently — never a `—` or `n/a`.
 * ================================================================ */
type Stat = { label: string; value: string };

function statsFor(r: Resorts): Stat[] {
  const out: Stat[] = [];
  if (typeof r.peak_m === "number")      out.push({ label: "Peak",     value: fmtMetres(r.peak_m) });
  if (typeof r.vertical_m === "number")  out.push({ label: "Vertical", value: fmtMetres(r.vertical_m) });
  if (typeof r.terrain_km === "number")  out.push({ label: "Terrain",  value: `${r.terrain_km} km` });
  if (typeof r.lifts === "number")       out.push({ label: "Lifts",    value: String(r.lifts) });
  if (typeof r.snowfall_cm === "number") out.push({ label: "Snowfall", value: fmtSnowfall(r.snowfall_cm) });
  return out;
}

function fmtMetres(m: number): string {
  // Thousands-separator + "m" unit; no decimals for altitudes/verticals.
  return `${m.toLocaleString("en-GB")} m`;
}

function fmtSnowfall(cm: number): string {
  // Metres when ≥ 100cm (one decimal place for readability), cm below.
  if (cm >= 100) {
    const m = cm / 100;
    const trimmed = Number.isInteger(m) ? String(m) : m.toFixed(1);
    return `${trimmed} m`;
  }
  return `${cm} cm`;
}

export function StatStrip({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <ul
      role="list"
      aria-label="Resort statistics"
      className="grid border border-rule bg-canvas-raised"
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((s, i) => (
        <li
          key={s.label}
          className={[
            "flex flex-col items-start gap-0.5 px-3 py-2",
            i > 0 ? "border-l border-rule" : "",
          ].join(" ")}
        >
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            {s.label}
          </span>
          <span className="font-mono text-[13px] leading-tight text-ink">
            {s.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ================================================================
 * StatusBadge — dot + label, four states. Dot colours bind to the
 * brand palette (pine/glacier/rust) via `--brand-*` triplets so they
 * are theme-independent.
 * ================================================================ */
export type ResortStatus = "open" | "in-season" | "out-of-season" | "closed";

const STATUS_COPY: Record<ResortStatus, string> = {
  open: "Open",
  "in-season": "In season",
  "out-of-season": "Out of season",
  closed: "Closed",
};

export function StatusBadge({ status }: { status: ResortStatus }) {
  // Dot colour by state:
  //   open         — pine on light / glacier on dark (via --accent, which
  //                   flips to glacier in dark where pine would vanish on
  //                   carbon per the brand system's dark-mode doctrine)
  //   in-season    — glacier (readable on both canvases)
  //   out-of-season — transparent fill, --rule-strong border
  //   closed       — rust (readable on both canvases)
  const dotStyle: React.CSSProperties = (() => {
    switch (status) {
      case "open":
        return { backgroundColor: "var(--accent)" };
      case "in-season":
        return { backgroundColor: "rgb(var(--brand-glacier))" };
      case "out-of-season":
        return { backgroundColor: "transparent", borderColor: "var(--rule-strong)" };
      case "closed":
        return { backgroundColor: "rgb(var(--brand-rust))" };
    }
  })();
  const textClass =
    status === "out-of-season" || status === "closed"
      ? "label text-ink-muted"
      : "label text-ink";
  return (
    <span
      className="inline-flex items-center gap-1.5"
      aria-label={`Status: ${STATUS_COPY[status].toLowerCase()}`}
    >
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full border"
        style={{ borderColor: "var(--rule-strong)", ...dotStyle }}
      />
      <span className={textClass}>{STATUS_COPY[status].toUpperCase()}</span>
    </span>
  );
}

/* ================================================================
 * SeasonBar — 12-cell SVG strip. Open window filled with --ink;
 * closed cells use --rule-strong. The current month gets a tick
 * marker above its cell. Handles cross-year windows (Dec → Apr).
 * ================================================================ */
const MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function SeasonBar({
  from,
  to,
  dim = false,
}: {
  from: string; // "MM-DD"
  to: string;   // "MM-DD"
  dim?: boolean; // de-emphasise when out of season
}) {
  const fromMonth = parseMonth(from); // 0..11
  const toMonth = parseMonth(to);     // 0..11
  const todayMonth = new Date().getMonth();

  const open = Array(12)
    .fill(false)
    .map((_, i) => inWindow(i, fromMonth, toMonth));

  // Fixed cell geometry. 12 cells × 20 units + 11 × 2 unit gaps = 262.
  // Month letters live inside the same SVG so they stay perfectly aligned
  // to their cells at every viewport width (an earlier CSS-grid approach
  // used ratio-as-percent gaps and clipped the final "D").
  const CELL_W = 20;
  const GAP = 2;
  const BAR_H = 10;
  const totalW = 12 * CELL_W + 11 * GAP;
  const totalH = BAR_H + 16;
  const label = `Season — ${formatMD(from)} to ${formatMD(to)}`;

  return (
    <figure aria-label={`Season from ${formatMD(from)} to ${formatMD(to)}`}>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className={["w-full overflow-visible", dim ? "opacity-60" : ""].join(" ")}
        role="img"
      >
        {/* Today marker — 2px tick above the current month's cell */}
        <rect
          x={todayMonth * (CELL_W + GAP) + CELL_W / 2 - 1}
          y={0}
          width={2}
          height={4}
          fill="var(--ink)"
        />
        {/* Cells */}
        {open.map((isOpen, i) => (
          <rect
            key={i}
            x={i * (CELL_W + GAP)}
            y={6}
            width={CELL_W}
            height={BAR_H}
            fill={isOpen ? "var(--ink)" : "var(--rule-strong)"}
          />
        ))}
        {/* Month letters — centred under each cell, inside the SVG so the
            12th letter never clips at narrow viewports. */}
        {MONTH_LETTERS.map((m, i) => (
          <text
            key={i}
            x={i * (CELL_W + GAP) + CELL_W / 2}
            y={totalH - 2}
            textAnchor="middle"
            fontSize={6}
            fontFamily="var(--font-geist-mono), ui-monospace, monospace"
            fill="var(--ink-faint)"
            aria-hidden
          >
            {m}
          </text>
        ))}
      </svg>
      <figcaption className="mt-2 font-ui text-xs text-ink-muted">{label}</figcaption>
    </figure>
  );
}

function parseMonth(mmdd: string): number {
  const n = parseInt(mmdd.split("-")[0] ?? "", 10);
  return Number.isFinite(n) ? Math.max(0, Math.min(11, n - 1)) : 0;
}

// Window inclusion — handles the wrap-around case where `to < from`
// (e.g. Dec 15 → Apr 20).
function inWindow(month: number, from: number, to: number): boolean {
  if (from <= to) return month >= from && month <= to;
  return month >= from || month <= to;
}

function formatMD(mmdd: string): string {
  const [mm, dd] = mmdd.split("-").map((p) => parseInt(p, 10));
  if (!mm || !dd) return mmdd;
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[mm - 1]} ${dd}`;
}

/* ================================================================
 * ActivityChips — hairline-border pills, max 6 shown, overflow
 * collapses to "+ N more" as the seventh chip.
 * ================================================================ */
export function ActivityChips({
  activities,
  max = 6,
}: {
  activities: Activity[];
  max?: number;
}) {
  if (!activities || activities.length === 0) return null;
  const shown = activities.slice(0, max);
  const overflow = Math.max(0, activities.length - max);

  return (
    <div>
      <div className="label text-ink-faint">Activities</div>
      <ul
        className="mt-2 flex flex-wrap gap-1.5"
        aria-label={`${activities.length} activities`}
      >
        {shown.map((a) => (
          <li
            key={a}
            className="inline-flex items-center rounded-sm border border-rule px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-muted"
          >
            {ACTIVITY_LABEL[a]}
          </li>
        ))}
        {overflow > 0 && (
          <li
            className="inline-flex items-center rounded-sm border border-rule px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint"
            aria-label={`and ${overflow} more activities`}
          >
            + {overflow} MORE
          </li>
        )}
      </ul>
    </div>
  );
}

/* ================================================================
 * deriveStatus — maps (operational_status + season window + today)
 * to one of the four display states. Returns null when the record
 * doesn't carry enough to compute — the panel renders without the
 * badge rather than guess.
 * ================================================================ */
export function deriveStatus(
  r: Pick<Resorts, "operational_status" | "season_from" | "season_to">,
  now: Date = new Date(),
): ResortStatus | null {
  const op: OperationalStatus = r.operational_status;
  if (op === "year-round") return "open";
  if (op === "closed") return "closed";
  if (op === "seasonal" && r.season_from && r.season_to) {
    const fromM = parseMonth(r.season_from);
    const toM = parseMonth(r.season_to);
    const nowM = now.getMonth();
    return inWindow(nowM, fromM, toM) ? "in-season" : "out-of-season";
  }
  return null;
}

/* ================================================================
 * Content shaping — unchanged resort/rental/repair/guide summaries,
 * extended with `country` for the resort place line.
 * ================================================================ */

type Summary = {
  category: MapCategory;
  title: string;
  place: string;
  hero: string | null;
  body: string | null;
  href: string | null;
  details: Array<{ label: string; value: string; href?: string }>;
};

function summarise(content: PreviewContent, category: MapCategory): Summary {
  const title = content.name || "Untitled";
  const hero = heroFor(content);
  switch (category) {
    case "resorts":
      return summariseResort(content as Resorts, hero);
    case "rentals":
      return summariseRental(content as Rentals, hero);
    case "repairs":
      return summariseRepair(content as Repairs, hero);
    case "guides":
      return summariseGuide(content as Guides, hero);
    default:
      return {
        category,
        title,
        place: "",
        hero,
        body: null,
        href: null,
        details: [],
      };
  }
}

function heroFor(c: PreviewContent): string | null {
  const url =
    (c as Resorts).cover_image ||
    c.image_url ||
    (c as Rentals).profile_picture ||
    "";
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url}`;
}

function summariseResort(r: Resorts, hero: string | null): Summary {
  const details: Summary["details"] = [];
  if (r.altitude && r.altitude !== "—") details.push({ label: "Altitude", value: r.altitude });
  if (r.snowfall_per_year)      details.push({ label: "Snowfall",      value: r.snowfall_per_year });
  if (r.opening_times)          details.push({ label: "Opening times", value: r.opening_times });
  if (r.nearest_rail_station)   details.push({ label: "Nearest rail",  value: r.nearest_rail_station });
  if (r.nearest_charge_point)   details.push({ label: "Charge point",  value: r.nearest_charge_point });
  if (r.total_score && r.total_score > 0)
    details.push({ label: "Oütlas score", value: `${r.total_score}/100` });
  return {
    category: "resorts",
    title: r.name,
    place: r.country || r.region || "—",
    hero,
    body: null,
    href: `/stories`,
    details,
  };
}

function summariseRental(r: Rentals, hero: string | null): Summary {
  const details: Summary["details"] = [];
  if (r.gear_for_rent)   details.push({ label: "Gear",    value: r.gear_for_rent });
  if (r.phone_number)    details.push({ label: "Phone",   value: r.phone_number, href: `tel:${r.phone_number}` });
  if (r.email_address)   details.push({ label: "Email",   value: r.email_address, href: `mailto:${r.email_address}` });
  if (r.resort_Address)  details.push({ label: "Address", value: r.resort_Address });
  if (r.resort_website)  details.push({ label: "Website", value: strip(r.resort_website), href: ensureHttp(r.resort_website) ?? undefined });
  return {
    category: "rentals",
    title: r.name,
    place: r.regions || r.resorts || "Scotland",
    hero,
    body: r.resort_description || null,
    href: ensureHttp(r.resort_website),
    details,
  };
}

function summariseRepair(r: Repairs, hero: string | null): Summary {
  const details: Summary["details"] = [];
  if (r.repair_address)  details.push({ label: "Address", value: r.repair_address });
  if (r.repair_phone)    details.push({ label: "Phone",   value: r.repair_phone, href: `tel:${r.repair_phone}` });
  if (r.opening_times)   details.push({ label: "Hours",   value: r.opening_times });
  if (r.repair_website)  details.push({ label: "Website", value: strip(r.repair_website), href: ensureHttp(r.repair_website) ?? undefined });
  if (r.accept_in_person_visits)
    details.push({ label: "Walk-ins", value: r.accept_in_person_visits });
  return {
    category: "repairs",
    title: r.name,
    place: r.regions || "Scotland",
    hero,
    body: null,
    href: ensureHttp(r.repair_website),
    details,
  };
}

function summariseGuide(g: Guides, hero: string | null): Summary {
  const details: Summary["details"] = [];
  if (g.disciplines)   details.push({ label: "Disciplines", value: g.disciplines });
  if (g.languages)     details.push({ label: "Languages",   value: g.languages });
  if (g.rate_per_day)  details.push({ label: "Day rate",    value: g.rate_per_day });
  if (g.phone)         details.push({ label: "Phone",       value: g.phone, href: `tel:${g.phone}` });
  if (g.website)       details.push({ label: "Website",     value: strip(g.website), href: ensureHttp(g.website) ?? undefined });
  return {
    category: "guides",
    title: g.name,
    place: g.regions || "Scotland",
    hero,
    body: g.bio || null,
    href: ensureHttp(g.website),
    details,
  };
}

function strip(url: string | undefined | null): string {
  if (!url) return "";
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
function ensureHttp(url: string | undefined | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `https://${url}`;
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowOutIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 17L17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
