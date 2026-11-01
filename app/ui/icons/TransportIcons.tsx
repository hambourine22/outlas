// Transport icon system — hairline construction, geometric primitives,
// no decorative fluff. Vocabulary pulled from the Dot Dot Dot "Design in
// N-Dimensions" reference pages (IMG_7172–IMG_7180): orthogonal strokes,
// uniform 1.6px weight, functional-not-illustrative.
//
// Conventions
// - 16×16 viewBox so icons sit next to 14–16px type without rescaling.
// - stroke="currentColor" so the icon flips with --ink per theme.
// - strokeWidth={1.6} matches the design system's hairline (chevrons,
//   external-link glyph).
// - No fills unless noted — fills are opt-in per icon.
//
// One geometry source for two renderers: the React components below draw
// it for the sidebar key, and `glyphMarkup` serialises it for the map's
// symbol images (Mapbox needs a bitmap, not a component).
//
// Spec: docs/briefs/transport-icon-key.md

import { type SVGProps } from "react";
import type { TransportKind } from "@/app/content/map/transport";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

type GlyphPart =
  | { el: "path"; d: string }
  | { el: "rect"; x: number; y: number; width: number; height: number; rx: number }
  | { el: "dot"; cx: number; cy: number; r: number };   // filled, no stroke

const GLYPHS: Record<TransportKind, GlyphPart[]> = {
  /* --------------------------------------------------------------------- */
  /* station — side profile of a railway carriage: a body rectangle with  */
  /* a vertical divider (door) and two wheels. Reads as "train" at 16px   */
  /* while using only orthogonals + two filled circles.                   */
  /* --------------------------------------------------------------------- */
  station: [
    { el: "rect", x: 2.5, y: 3, width: 11, height: 7, rx: 0.6 },   // body
    { el: "path", d: "M8 3 L8 10" },                               // door
    { el: "dot", cx: 5, cy: 12.5, r: 1 },                          // wheels
    { el: "dot", cx: 11, cy: 12.5, r: 1 },
  ],
  /* --------------------------------------------------------------------- */
  /* charge — lightning bolt as a four-segment zigzag. Open path (no      */
  /* fill) matches the hairline vocabulary and reads as electrical        */
  /* without the heavy solid shape of the usual "⚡" glyph.               */
  /* --------------------------------------------------------------------- */
  charge: [{ el: "path", d: "M10 2 L5 8.5 L8 8.5 L6 14" }],
};

function Svg({ size = 16, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

function Glyph({ kind, ...props }: IconProps & { kind: TransportKind }) {
  return (
    <Svg {...props}>
      {GLYPHS[kind].map((p, i) => {
        switch (p.el) {
          case "path":
            return <path key={i} d={p.d} />;
          case "rect":
            return <rect key={i} x={p.x} y={p.y} width={p.width} height={p.height} rx={p.rx} />;
          case "dot":
            return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="currentColor" stroke="none" />;
        }
      })}
    </Svg>
  );
}

export function TrainStation(props: IconProps) {
  return <Glyph kind="station" {...props} />;
}

export function ChargePoint(props: IconProps) {
  return <Glyph kind="charge" {...props} />;
}

// SVG child markup for one glyph in a fixed colour, in the 16-unit
// viewBox. The caller wraps it (plate, scale, stroke width and caps).
export function glyphMarkup(kind: TransportKind, colour: string): string {
  return GLYPHS[kind]
    .map((p) => {
      switch (p.el) {
        case "path":
          return `<path d="${p.d}" fill="none" stroke="${colour}"/>`;
        case "rect":
          return `<rect x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" rx="${p.rx}" fill="none" stroke="${colour}"/>`;
        case "dot":
          return `<circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="${colour}"/>`;
      }
    })
    .join("");
}
