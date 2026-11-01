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
// Spec: docs/briefs/transport-icon-key.md

import { type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

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

/* ----------------------------------------------------------------------- */
/* TrainStation — side profile of a railway carriage: a body rectangle    */
/* with a vertical divider (door) and two wheels. Reads as "train" at     */
/* 16px while using only orthogonals + two filled circles.                */
/* ----------------------------------------------------------------------- */
export function TrainStation(props: IconProps) {
  return (
    <Svg {...props}>
      {/* body */}
      <rect x={2.5} y={3} width={11} height={7} rx={0.6} />
      {/* door / divider */}
      <path d="M8 3 L8 10" />
      {/* wheels */}
      <circle cx={5} cy={12.5} r={1} fill="currentColor" stroke="none" />
      <circle cx={11} cy={12.5} r={1} fill="currentColor" stroke="none" />
    </Svg>
  );
}

/* ----------------------------------------------------------------------- */
/* ChargePoint — lightning bolt as a four-segment zigzag. Open path       */
/* (no fill) matches the hairline vocabulary and reads as electrical     */
/* without the heavy solid shape of the usual "⚡" glyph.                 */
/* ----------------------------------------------------------------------- */
export function ChargePoint(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 2 L5 8.5 L8 8.5 L6 14" />
    </Svg>
  );
}
