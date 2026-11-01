import { anatomy } from "@/app/lib/design-system";
import {
  boxWith, silhouette, band, liftLine, pathD, yAt, rings, ringArc, snapDomain,
  trough, shoreRungsOnRing, asProfile,
  type MountainStats, type SurfStats, type Ring, type Box,
} from "@/app/lib/anatomy";

/* -------------------------------------------------------------------------
 * ResortAnatomy — the static primitive. One contoured shape per resort.
 *
 *   kind     mountain (rises above the ground line) · surf (drops below the
 *            waterline, the town on the near shore as rungs)
 *   aspect   wide 400 × 320 for rows and specimens · square 320 × 320 for a
 *            resort preview, where it sits alone on a small screen
 *   scale    fixed — the comparability frame, for glyphs side by side
 *            fit   — each axis snapped to the smallest ladder rung that holds
 *                    the value, so one glyph fills its frame; the tick and
 *                    the bar drawn on the glyph say which scale it is
 *
 * Contours are rings seen from a low angle (anatomy.ring). Colours are the
 * semantic CSS tokens; hairlines stay hairlines at any rendered size.
 * ---------------------------------------------------------------------- */

type Scale = "fixed" | "fit";
type Aspect = "wide" | "square";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const FRAMES = {
  wide:   { vw: 400, vh: 320, legend: 9,  mountain: { w: 360, h: 220, ground: 264 }, surf: { w: 360, d: 190, water: 60 } },
  square: { vw: 320, vh: 320, legend: 11, mountain: { w: 272, h: 200, ground: 248 }, surf: { w: 272, d: 176, water: 56 } },
} as const;

type Props = {
  name?: string;
  country?: string;
  width?: number;      // px; omit to fill the container (the viewBox keeps the aspect)
  aspect?: Aspect;
  scale?: Scale;
  readouts?: boolean;
  className?: string;
} & ({ kind?: "mountain"; stats: MountainStats } | { kind: "surf"; stats: SurfStats });

export function ResortAnatomy(props: Props) {
  const { name, country, width, aspect = "wide", scale = "fit", readouts = true, className = "" } = props;
  const F = FRAMES[aspect];
  const glyph = props.kind === "surf" ? surfGlyph(props.stats, F, scale) : mountainGlyph(props.stats, F, scale);
  const label = `${name ?? "Resort"}: ${glyph.aria}`;

  return (
    <figure className={`m-0 ${className}`} style={{ width: width ?? "100%" }}>
      <svg viewBox={`0 0 ${F.vw} ${F.vh}`} width={width ?? "100%"} height={width ? (width * F.vh) / F.vw : undefined} role="img" aria-label={label} className="block h-auto w-full">
        {glyph.svg}
      </svg>
      {aspect === "square" && (
        <div className="micro mt-2 text-ink-faint">scale · {glyph.scaleNote}</div>
      )}
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

const km = (v: number) => (v < 1 ? `${Math.round(v * 1000)} m` : `${v} km`);

// One contour ring: far half first (faint), near half on top.
function RingPaths({ r, cx }: { r: Ring; cx: number }) {
  const stroke = r.inBand ? "var(--ink)" : "var(--rule)";
  const near = r.inBand ? 0.55 * r.alpha : 1;
  return (
    <>
      <path d={pathD(ringArc(r, cx, "far"))} fill="none" stroke={stroke} strokeWidth={0.5} opacity={near * anatomy.ring.back} vectorEffect="non-scaling-stroke" />
      <path d={pathD(ringArc(r, cx, "near"))} fill="none" stroke={stroke} strokeWidth={0.5} opacity={near} vectorEffect="non-scaling-stroke" />
    </>
  );
}

function Legend({ box, F, tick, bar, dir, ry }: { box: Box; F: (typeof FRAMES)[Aspect]; tick: number; bar: number; dir: 1 | -1; ry: number }) {
  const tickPx = tick * box.pxPerM;
  const barPx = bar * box.pxPerKm;
  const y0 = box.ground;
  const barY = dir > 0 ? y0 + ry + 14 : y0 - ry - 14;
  return (
    <>
      <line x1={12} x2={12} y1={y0} y2={y0 - tickPx * dir} stroke="var(--rule-strong)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
      <text x={16} y={dir > 0 ? y0 - tickPx + 4 : y0 + tickPx - 2} fontSize={F.legend} fill="var(--ink-faint)" fontFamily={MONO}>{tick} m</text>
      <line x1={F.vw - 12 - barPx} x2={F.vw - 12} y1={barY} y2={barY} stroke="var(--rule-strong)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
      <text x={F.vw - 12} y={dir > 0 ? barY + 10 : barY - 4} fontSize={F.legend} textAnchor="end" fill="var(--ink-faint)" fontFamily={MONO}>{km(bar)}</text>
    </>
  );
}

function mountainGlyph(stats: MountainStats, F: (typeof FRAMES)[Aspect], scale: Scale) {
  const alt = scale === "fit" ? snapDomain(stats.peak, anatomy.ladder.altitude) : { domain: anatomy.domain.altitude, step: 1000 };
  const ter = scale === "fit" ? snapDomain(stats.terrain, anatomy.ladder.terrain) : { domain: anatomy.domain.terrain, step: 100 };
  const box = boxWith(F.mountain.w, F.mountain.h, F.vw / 2, F.mountain.ground, alt.domain, ter.domain, 1);
  const sil = silhouette(stats, box);
  const cap = band(stats, box);
  const rs = rings(stats, box);
  const lift = liftLine(stats, box);
  const vertical = Math.max(0, Math.round(stats.peak - stats.base));
  const groundRy = rs[0]?.ry ?? 0;
  return {
    aria: `${Math.round(stats.peak)} m peak, ${vertical} m vertical, ${Math.round(stats.terrain)} km of terrain, ${Math.round(stats.lifts)} lifts`,
    scaleNote: `tick ${alt.step} m · bar ${km(ter.step)}`,
    readouts: [
      { k: "peak", v: `${Math.round(stats.peak)} m` },
      { k: "vertical", v: `${vertical} m` },
      { k: "terrain", v: `${Math.round(stats.terrain)} km` },
      { k: "lifts", v: `${Math.round(stats.lifts)}` },
      { k: "snow", v: stats.snowfall !== undefined ? `${Math.round(stats.snowfall)} cm` : "—" },
    ],
    svg: (
      <>
        <line x1={8} x2={F.vw - 8} y1={box.ground} y2={box.ground} stroke="var(--rule)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <Legend box={box} F={F} tick={alt.step} bar={ter.step} dir={1} ry={groundRy} />
        {rs.map((r) => (
          <path key={`f${r.a}`} d={pathD(ringArc(r, box.cx, "far"))} fill="none" stroke={r.inBand ? "var(--ink)" : "var(--rule)"} strokeWidth={0.5} opacity={(r.inBand ? 0.55 * r.alpha : 1) * anatomy.ring.back} vectorEffect="non-scaling-stroke" />
        ))}
        <path d={pathD(sil)} fill="none" stroke="var(--rule)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <path d={pathD(cap)} fill="none" stroke="var(--ink)" strokeWidth={1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {rs.map((r) => (
          <path key={`n${r.a}`} d={pathD(ringArc(r, box.cx, "near"))} fill="none" stroke={r.inBand ? "var(--ink)" : "var(--rule)"} strokeWidth={0.5} opacity={r.inBand ? 0.55 * r.alpha : 1} vectorEffect="non-scaling-stroke" />
        ))}
        <line x1={lift.from[0]} y1={lift.from[1]} x2={lift.to[0]} y2={lift.to[1]} stroke="var(--accent)" strokeWidth={0.75} strokeDasharray={anatomy.lift.dash.join(" ")} opacity={0.7} vectorEffect="non-scaling-stroke" />
        {lift.nodes.map((n, i) => <circle key={i} cx={n[0]} cy={n[1]} r={anatomy.lift.node} fill="var(--accent)" />)}
        <circle cx={box.cx} cy={yAt(stats.peak, box)} r={2.5} fill="var(--ink)" />
      </>
    ),
  };
}

function surfGlyph(stats: SurfStats, F: (typeof FRAMES)[Aspect], scale: Scale) {
  const dep = scale === "fit" ? snapDomain(stats.depth, anatomy.ladder.depth) : { domain: anatomy.surf.domain.depth, step: 1000 };
  const coa = scale === "fit" ? snapDomain(stats.coast, anatomy.ladder.coast) : { domain: anatomy.surf.domain.coast, step: 1 };
  const box = boxWith(F.surf.w, F.surf.d, F.vw / 2, F.surf.water, dep.domain, coa.domain, -1);
  const profile = trough(stats, box);
  const rs = rings(asProfile(stats), box, anatomy.surf.contour);
  const rungs = shoreRungsOnRing(stats, box);
  const shoreRy = rs[0]?.ry ?? 0;
  return {
    aria: `${Math.round(stats.depth)} m of water offshore, ${stats.coast} km of coast, a town of about ${Math.round(stats.population).toLocaleString()}`,
    scaleNote: `tick ${dep.step} m · bar ${km(coa.step)}`,
    readouts: [
      { k: "depth", v: `${Math.round(stats.depth)} m` },
      { k: "coast", v: `${stats.coast} km` },
      { k: "town", v: `≈ ${Math.round(stats.population / 100) / 10} k` },
    ],
    svg: (
      <>
        <line x1={8} x2={F.vw - 8} y1={box.ground} y2={box.ground} stroke="var(--rule-strong)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <Legend box={box} F={F} tick={dep.step} bar={coa.step} dir={-1} ry={shoreRy} />
        {rs.map((r) => <RingPaths key={r.a} r={{ ...r, inBand: true }} cx={box.cx} />)}
        <path d={pathD(profile)} fill="none" stroke="var(--ink)" strokeWidth={1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {rungs.map((n, i) => <circle key={i} cx={n[0]} cy={n[1]} r={anatomy.lift.node} fill="var(--accent)" />)}
        <circle cx={box.cx} cy={yAt(stats.depth, box)} r={2.5} fill="var(--ink)" />
      </>
    ),
  };
}
