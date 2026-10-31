import { anatomy } from "@/app/lib/design-system";
import { boxFor, silhouette, band, contours, liftLine, pathD, yAt, type MountainStats } from "@/app/lib/anatomy";

/* -------------------------------------------------------------------------
 * ResortAnatomy — the static primitive. One contoured peak per resort, drawn
 * on a fixed 400 × 320 viewBox with fixed domains (4000 m tall, 400 km wide)
 * so every glyph is comparable wherever it appears: preview sidebar, resort
 * card, design-system specimen. Colours are the semantic CSS tokens, so it
 * follows the theme and any data-surface it sits on. Hairlines stay
 * hairlines at any rendered size (non-scaling strokes).
 * ---------------------------------------------------------------------- */

const VW = 400;
const VH = 320;
const BOX = boxFor(360, 256, VW / 2, 296); // 360 wide = the 400 km domain; 256 tall = 4000 m

export function ResortAnatomy({
  stats,
  name,
  country,
  width,
  readouts = true,
  className = "",
}: {
  stats: MountainStats;
  name?: string;
  country?: string;
  width?: number;      // px; omit to fill the container (the viewBox keeps the aspect)
  readouts?: boolean;
  className?: string;
}) {
  const sil = silhouette(stats, BOX);
  const cap = band(stats, BOX);
  const cs = contours(stats, BOX);
  const lift = liftLine(stats, BOX);
  const vertical = Math.max(0, Math.round(stats.peak - stats.base));
  const label = `${name ?? "Resort"}: ${Math.round(stats.peak)} m peak, ${vertical} m vertical, ${Math.round(stats.terrain)} km of terrain, ${Math.round(stats.lifts)} lifts`;
  const scaleTick = 1000 * BOX.pxPerM;
  const scaleBar = 100 * BOX.pxPerKm;

  return (
    <figure className={`m-0 ${className}`} style={{ width: width ?? "100%" }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} width={width ?? "100%"} height={width ? (width * VH) / VW : undefined} role="img" aria-label={label} className="block h-auto w-full">
        {/* ground */}
        <line x1={8} x2={VW - 8} y1={BOX.ground} y2={BOX.ground} stroke="var(--rule)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        {/* scale — 1000 m up, 100 km across */}
        <line x1={12} x2={12} y1={BOX.ground} y2={BOX.ground - scaleTick} stroke="var(--rule-strong)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <text x={16} y={BOX.ground - scaleTick + 4} fontSize={9} fill="var(--ink-faint)" fontFamily="var(--font-geist-mono), ui-monospace, monospace">1000 m</text>
        <line x1={VW - 12 - scaleBar} x2={VW - 12} y1={BOX.ground + 10} y2={BOX.ground + 10} stroke="var(--rule-strong)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <text x={VW - 12} y={BOX.ground + 20} fontSize={9} textAnchor="end" fill="var(--ink-faint)" fontFamily="var(--font-geist-mono), ui-monospace, monospace">100 km</text>
        {/* the whole mountain, faint */}
        <path d={pathD(sil)} fill="none" stroke="var(--rule)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        {/* contours in the skiable band */}
        {cs.map((c) => (
          <line key={c.a} x1={c.x0} x2={c.x1} y1={yAt(c.a, BOX)} y2={yAt(c.a, BOX)} stroke="var(--ink)" strokeWidth={0.5} opacity={0.55 * c.alpha} vectorEffect="non-scaling-stroke" />
        ))}
        {/* the band — base to peak */}
        <path d={pathD(cap)} fill="none" stroke="var(--ink)" strokeWidth={1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {/* lift line + rungs */}
        <line x1={lift.from[0]} y1={lift.from[1]} x2={lift.to[0]} y2={lift.to[1]} stroke="var(--accent)" strokeWidth={0.75} strokeDasharray={anatomy.lift.dash.join(" ")} opacity={0.7} vectorEffect="non-scaling-stroke" />
        {lift.nodes.map((n, i) => (
          <circle key={i} cx={n[0]} cy={n[1]} r={anatomy.lift.node} fill="var(--accent)" />
        ))}
        {/* summit */}
        <circle cx={BOX.cx} cy={yAt(stats.peak, BOX)} r={2.5} fill="var(--ink)" />
      </svg>
      {readouts && (
        <figcaption className="mt-3">
          {name && (
            <div className="font-display text-section leading-tight text-ink">
              {name}
              {country && <span className="ml-2 label text-ink-faint">{country}</span>}
            </div>
          )}
          <dl className="mt-2 grid grid-cols-5 gap-2 font-mono text-xs text-ink-muted">
            <div><dt className="micro text-ink-faint">peak</dt><dd>{Math.round(stats.peak)} m</dd></div>
            <div><dt className="micro text-ink-faint">vertical</dt><dd>{vertical} m</dd></div>
            <div><dt className="micro text-ink-faint">terrain</dt><dd>{Math.round(stats.terrain)} km</dd></div>
            <div><dt className="micro text-ink-faint">lifts</dt><dd>{Math.round(stats.lifts)}</dd></div>
            <div><dt className="micro text-ink-faint">snow</dt><dd>{stats.snowfall !== undefined ? `${Math.round(stats.snowfall)} cm` : "—"}</dd></div>
          </dl>
        </figcaption>
      )}
    </figure>
  );
}
