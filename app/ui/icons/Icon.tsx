import type { SVGProps } from "react";
import { iconography } from "@/app/lib/design-system";
import { ICONS, type IconDef, type IconName } from "./icons";

// The one way to draw a UI icon. Geometry comes from the registry; trim,
// stroke and caps come from the `iconography` token so a change there moves
// every glyph at once.
//
// Line weight: the HUX spec is a 1px line at the 24px standard size. Below
// 24 the drawing scales but the line does not — `vector-effect:
// non-scaling-stroke` keeps it 1px on screen instead of thinning to a
// fraction of a pixel. Above 24 (hero use) the line scales with the glyph,
// which is the "adjust optically" allowance.
//
// Accessibility: an icon beside text is decoration — leave `label` off and
// it is aria-hidden. An icon that *is* the meaning (icon-only button, a
// legend key) gets `label`, which makes it role="img" with that name. The
// button around it should still carry its own aria-label.

type Props = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: (typeof iconography.sizes)[number] | number;
  label?: string;
};

export function Icon({ name, size = iconography.trim, label, ...rest }: Props) {
  // Widen from the registry's literal types so optional part fields exist.
  const def: IconDef = ICONS[name];
  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };
  const keepLine = size < iconography.trim ? ("non-scaling-stroke" as const) : undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${iconography.trim} ${iconography.trim}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={iconography.stroke}
      strokeLinecap={iconography.cap}
      strokeLinejoin={iconography.join}
      {...a11y}
      {...rest}
    >
      {def.parts.map((p, i) => {
        switch (p.el) {
          case "path":
            return <path key={i} d={p.d} vectorEffect={keepLine} />;
          case "circle":
            return p.dot
              ? <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="currentColor" stroke="none" />
              : <circle key={i} cx={p.cx} cy={p.cy} r={p.r} vectorEffect={keepLine} />;
          case "rect":
            return <rect key={i} x={p.x} y={p.y} width={p.width} height={p.height} rx={p.rx} transform={p.transform} vectorEffect={keepLine} />;
        }
      })}
    </svg>
  );
}
