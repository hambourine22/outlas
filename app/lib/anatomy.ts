import { anatomy } from "@/app/lib/design-system";

/* -------------------------------------------------------------------------
 * Anatomy geometry — pure functions, no DOM. The SVG primitive
 * (app/ui/ResortAnatomy.tsx) and the canvas motion piece draw from these
 * same functions, so a glyph in the sidebar and a glyph on the 4:5 frame are
 * the same shape at a different scale.
 *
 * Mountain form. Altitude is the vertical axis from a common ground line;
 * terrain is the width; the skiable band (base → peak) carries the ink and
 * the contour lines; the foot below the base is drawn faint. The lift line
 * runs from the band's left base to the summit with one rung per lift.
 * ---------------------------------------------------------------------- */

export type Kind = (typeof anatomy.kinds)[number];

export type MountainStats = {
  peak: number;      // m
  base: number;      // m — peak minus vertical drop
  terrain: number;   // km of pisted terrain
  lifts: number;
  snowfall?: number; // cm per year — a readout, not geometry
};

export type Pt = [number, number];

// A drawing box: where the ground line sits, where the summit column is,
// and the fixed px-per-unit scales that make glyphs comparable.
export type Box = { cx: number; ground: number; pxPerM: number; pxPerKm: number };

export function boxFor(width: number, height: number, cx: number, ground: number): Box {
  return {
    cx,
    ground,
    pxPerM: height / anatomy.domain.altitude,
    pxPerKm: width / anatomy.domain.terrain,
  };
}

export const yAt = (a: number, box: Box) => box.ground - a * box.pxPerM;

// Half-width of the silhouette at altitude a. side −1 is the left flank,
// slightly narrower, so the peak reads as a mountain rather than a cone.
export function flankX(a: number, s: MountainStats, box: Box, side: 1 | -1): number {
  const peak = Math.max(1, s.peak);
  const t = Math.min(1, Math.max(0, a / peak));
  const half = (s.terrain * box.pxPerKm) / 2;
  const x = half * Math.pow(1 - t, anatomy.flank);
  return box.cx + side * x * (side < 0 ? anatomy.asym : 1);
}

// Points along one flank between two altitudes, inclusive, ascending.
function flank(s: MountainStats, box: Box, side: 1 | -1, from: number, to: number, step: number): Pt[] {
  const pts: Pt[] = [[flankX(from, s, box, side), yAt(from, box)]];
  for (let a = Math.floor(from / step) * step + step; a < to; a += step) pts.push([flankX(a, s, box, side), yAt(a, box)]);
  pts.push([flankX(to, s, box, side), yAt(to, box)]);
  return pts;
}

// The whole mountain, ground to summit to ground.
export function silhouette(s: MountainStats, box: Box, step = 40): Pt[] {
  const peak = Math.max(1, s.peak);
  const left = flank(s, box, -1, 0, peak, step);
  const right = flank(s, box, 1, 0, peak, step).reverse();
  return [...left, ...right];
}

// The skiable band only — base up to the summit and down again.
export function band(s: MountainStats, box: Box, step = 40): Pt[] {
  const peak = Math.max(1, s.peak);
  const base = Math.min(Math.max(0, s.base), peak);
  const left = flank(s, box, -1, base, peak, step);
  const right = flank(s, box, 1, base, peak, step).reverse();
  return [...left, ...right];
}

// Contour lines across the band at every `anatomy.contour` metres. `alpha`
// fades a line in over half an interval as it enters the band, so a morphing
// glyph grows contours instead of popping them.
export function contours(s: MountainStats, box: Box): { a: number; x0: number; x1: number; alpha: number }[] {
  const peak = Math.max(1, s.peak);
  const base = Math.min(Math.max(0, s.base), peak);
  const step = anatomy.contour;
  const ramp = step / 2;
  const out: { a: number; x0: number; x1: number; alpha: number }[] = [];
  for (let a = Math.ceil(base / step) * step; a < peak; a += step) {
    const alpha = Math.min(1, (a - base) / ramp, (peak - a) / ramp);
    if (alpha <= 0) continue;
    out.push({ a, x0: flankX(a, s, box, -1), x1: flankX(a, s, box, 1), alpha });
  }
  return out;
}

// The lift line: left base of the band to the summit, one rung per lift.
export function liftLine(s: MountainStats, box: Box): { from: Pt; to: Pt; nodes: Pt[] } {
  const peak = Math.max(1, s.peak);
  const base = Math.min(Math.max(0, s.base), peak);
  const from: Pt = [flankX(base, s, box, -1), yAt(base, box)];
  const to: Pt = [box.cx, yAt(peak, box)];
  const n = Math.max(0, Math.round(s.lifts));
  const nodes: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    nodes.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
  }
  return { from, to, nodes };
}

export function lerpStats(a: MountainStats, b: MountainStats, w: number): MountainStats {
  const l = (x: number, y: number) => x + (y - x) * w;
  return {
    peak: l(a.peak, b.peak),
    base: l(a.base, b.base),
    terrain: l(a.terrain, b.terrain),
    lifts: l(a.lifts, b.lifts),
    snowfall: a.snowfall !== undefined && b.snowfall !== undefined ? l(a.snowfall, b.snowfall) : b.snowfall,
  };
}

export function pathD(pts: Pt[]): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
}
