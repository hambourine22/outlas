import { anatomy } from "@/app/lib/design-system";
import {
  boxFor, silhouette, band, contours, liftLine, pathD, yAt,
  surfBoxFor, trough, troughContours, shoreRungs,
  type MountainStats, type SurfStats,
} from "@/app/lib/anatomy";

/* -------------------------------------------------------------------------
 * ResortAnatomy — the static primitive. One contoured shape per resort on a
 * fixed 400 × 320 viewBox with fixed domains, so every glyph is comparable
 * wherever it appears: preview sidebar, resort card, design-system specimen.
 *
 *   mountain — rises above the ground line: 4000 m tall, 400 km wide
 *   surf     — drops below the waterline: 5000 m deep, 5 km of coast,
 *              the town on the shore as rungs, one per 1,000 people
 *
 * Colours are the semantic CSS tokens, so it follows the theme and any
 * data-surface it sits on. Hairlines stay hairlines at any rendered size.
 * ---------------------------------------------------------------------- */

const VW = 400;
const VH = 320;
const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const MOUNTAIN_BOX = boxFor(360, 256, VW / 2, 296);   // ground near the bottom, summit room above
const SURF_BOX = surfBoxFor(360, 220, VW / 2, 56);    // waterline near the top, trough room below

type Props = {
  name?: string;
  country?: string;
  width?: number;      // px; omit to fill the container (the viewBox keeps the aspect)
  readouts?: boolean;
  className?: string;
} & ({ kind?: "mountain"; stats: MountainStats } | { kind: "surf"; stats: SurfStats });

export function ResortAnatomy(props: Props) {
  const { name, country, width, readouts = true, className = "" } = props;
  const isSurf = props.kind === "surf";
  const glyph = isSurf ? surfGlyph(props.stats) : mountainGlyph(props.stats);
  const label = `${name ?? "Resort"}: ${glyph.aria}`;

  return (
    <figure className={`m-0 ${className}`} style={{ width: width ?? "100%" }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} width={width ?? "100%"} height={width ? (width * VH) / VW : undefined} role="img" aria-label={label} className="block h-auto w-full">
        {glyph.svg}
      </svg>
      {readouts && (
        <figcaption className="mt-3">
          {name && (
            <div className="font-display text-section leading-tight text-ink">
              {name}
              {country && <span className="ml-2 label text-ink-faint">{country}</span>}
            </div>
          )}
          <dl className={`mt-2 grid gap-2 font-mono text-xs text-ink-muted ${glyph.readouts.length === 5 ? "grid-cols-5" : "grid-cols-3"}`}>
            {glyph.readouts.map((r) => (
              <div key={r.k}><dt className="micro text-ink-faint">{r.k}</dt><dd>{r.v}</dd></div>
            ))}
          </dl>
        </figcaption>
      )}
    </figure>
  );
}

function mountainGlyph(stats: MountainStats) {
  const box = MOUNTAIN_BOX;
  const sil = silhouette(stats, box);
  const cap = band(stats, box);
  const cs = contours(stats, box);
  const lift = liftLine(stats, box);
  const vertical = Math.max(0, Math.round(stats.peak - stats.base));
  const tick = 1000 * box.pxPerM;
  const bar = 100 * box.pxPerKm;
  return {
    aria: `${Math.round(stats.peak)} m peak, ${vertical} m vertical, ${Math.round(stats.terrain)} km of terrain, ${Math.round(stats.lifts)} lifts`,
    readouts: [
      { k: "peak", v: `${Math.round(stats.peak)} m` },
      { k: "vertical", v: `${vertical} m` },
      { k: "terrain", v: `${Math.round(stats.terrain)} km` },
      { k: "lifts", v: `${Math.round(stats.lifts)}` },
      { k: "snow", v: stats.snowfall !== undefined ? `${Math.round(stats.snowfall)} cm` : "—" },
    ],
    svg: (
      <>
        <line x1={8} x2={VW - 8} y1={box.ground} y2={box.ground} stroke="var(--rule)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <line x1={12} x2={12} y1={box.ground} y2={box.ground - tick} stroke="var(--rule-strong)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <text x={16} y={box.ground - tick + 4} fontSize={9} fill="var(--ink-faint)" fontFamily={MONO}>1000 m</text>
        <line x1={VW - 12 - bar} x2={VW - 12} y1={box.ground + 10} y2={box.ground + 10} stroke="var(--rule-strong)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <text x={VW - 12} y={box.ground + 20} fontSize={9} textAnchor="end" fill="var(--ink-faint)" fontFamily={MONO}>100 km</text>
        <path d={pathD(sil)} fill="none" stroke="var(--rule)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        {cs.map((c) => (
          <line key={c.a} x1={c.x0} x2={c.x1} y1={yAt(c.a, box)} y2={yAt(c.a, box)} stroke="var(--ink)" strokeWidth={0.5} opacity={0.55 * c.alpha} vectorEffect="non-scaling-stroke" />
        ))}
        <path d={pathD(cap)} fill="none" stroke="var(--ink)" strokeWidth={1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <line x1={lift.from[0]} y1={lift.from[1]} x2={lift.to[0]} y2={lift.to[1]} stroke="var(--accent)" strokeWidth={0.75} strokeDasharray={anatomy.lift.dash.join(" ")} opacity={0.7} vectorEffect="non-scaling-stroke" />
        {lift.nodes.map((n, i) => <circle key={i} cx={n[0]} cy={n[1]} r={anatomy.lift.node} fill="var(--accent)" />)}
        <circle cx={box.cx} cy={yAt(stats.peak, box)} r={2.5} fill="var(--ink)" />
      </>
    ),
  };
}

function surfGlyph(stats: SurfStats) {
  const box = SURF_BOX;
  const profile = trough(stats, box);
  const cs = troughContours(stats, box);
  const rungs = shoreRungs(stats, box);
  const tick = 1000 * box.pxPerM;
  const bar = 1 * box.pxPerKm;
  return {
    aria: `${Math.round(stats.depth)} m of water offshore, ${stats.coast} km of coast, a town of about ${Math.round(stats.population).toLocaleString()}`,
    readouts: [
      { k: "depth", v: `${Math.round(stats.depth)} m` },
      { k: "coast", v: `${stats.coast} km` },
      { k: "town", v: `≈ ${Math.round(stats.population / 100) / 10} k` },
    ],
    svg: (
      <>
        {/* the waterline */}
        <line x1={8} x2={VW - 8} y1={box.ground} y2={box.ground} stroke="var(--rule-strong)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        {/* scale — 1000 m down, 1 km across */}
        <line x1={12} x2={12} y1={box.ground} y2={box.ground + tick} stroke="var(--rule-strong)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <text x={16} y={box.ground + tick - 2} fontSize={9} fill="var(--ink-faint)" fontFamily={MONO}>1000 m</text>
        <line x1={VW - 12 - bar} x2={VW - 12} y1={box.ground - 10} y2={box.ground - 10} stroke="var(--rule-strong)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <text x={VW - 12} y={box.ground - 14} fontSize={9} textAnchor="end" fill="var(--ink-faint)" fontFamily={MONO}>1 km</text>
        {/* contours down the trough */}
        {cs.map((c) => (
          <line key={c.a} x1={c.x0} x2={c.x1} y1={yAt(c.a, box)} y2={yAt(c.a, box)} stroke="var(--ink)" strokeWidth={0.5} opacity={0.55 * c.alpha} vectorEffect="non-scaling-stroke" />
        ))}
        {/* the trough — all of it is the band */}
        <path d={pathD(profile)} fill="none" stroke="var(--ink)" strokeWidth={1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {/* the town, on the shore */}
        {rungs.map((n, i) => <circle key={i} cx={n[0]} cy={n[1] - 3} r={anatomy.lift.node} fill="var(--accent)" />)}
        {/* the deepest point */}
        <circle cx={box.cx} cy={yAt(stats.depth, box)} r={2.5} fill="var(--ink)" />
      </>
    ),
  };
}
