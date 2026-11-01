"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { mapCursor, motion } from "@/app/lib/design-system";

// The map's pointer — a rust dot that reads out where it is: latitude to
// its left, longitude to its right, zoom beneath. map.tsx drives it
// imperatively from the map's mouse events, so the dot never waits on a
// React render. Hidden on devices without hover (touch has no pointer to
// replace). Tokens: mapCursor in design-system.ts.

export type MapCursorHandle = {
  show: (point: { x: number; y: number }) => void;
  read: (lngLat: { lat: number; lng: number }, zoom: number) => void;
  hover: (on: boolean) => void;
  hide: () => void;
};

const { dot, ink, px, gap, hoverScale, orbit, decimals } = mapCursor;
const OFFSET = px / 2 + gap;
const ORBIT_R = 9.5; // in the orbit's 20-unit viewBox, centred on 0,0
const EQUATOR_RY = ORBIT_R * 0.32; // the equator seen from a little above
const FADE_EASE = motion.eases[motion.panel.ease].css;
const READOUT =
  "absolute whitespace-nowrap font-ui text-label uppercase tracking-wide tabular-nums";

const MapCursor = forwardRef<MapCursorHandle>(function MapCursor(_, ref) {
  const root = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLSpanElement>(null);
  const globe = useRef<SVGSVGElement>(null);
  const lat = useRef<HTMLSpanElement>(null);
  const lng = useRef<HTMLSpanElement>(null);
  const zoom = useRef<HTMLSpanElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      show(point) {
        if (!root.current) return;
        root.current.style.transform = `translate(${point.x}px, ${point.y}px)`;
        root.current.style.visibility = "visible";
      },
      read(lngLat, z) {
        if (lat.current) lat.current.textContent = lngLat.lat.toFixed(decimals.coord);
        if (lng.current) lng.current.textContent = lngLat.lng.toFixed(decimals.coord);
        if (zoom.current) zoom.current.textContent = z.toFixed(decimals.zoom);
      },
      hover(on) {
        if (disc.current) disc.current.style.transform = on ? `scale(${hoverScale})` : "";
        // data-on fades the globe in and runs its meridians (globals.css).
        if (globe.current) globe.current.toggleAttribute("data-on", on);
      },
      hide() {
        if (root.current) root.current.style.visibility = "hidden";
      },
    }),
    [],
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-10 hidden [@media(hover:hover)]:block"
      style={{ visibility: "hidden", color: ink }}
    >
      <span
        ref={disc}
        className="absolute rounded-full transition-transform duration-150"
        style={{ width: px, height: px, left: -px / 2, top: -px / 2, backgroundColor: dot }}
      />
      <svg
        ref={globe}
        className="map-cursor-orbit absolute overflow-visible"
        width={orbit.px}
        height={orbit.px}
        viewBox="-10 -10 20 20"
        fill="none"
        stroke={dot}
        strokeWidth={orbit.stroke}
        style={{
          left: -orbit.px / 2,
          top: -orbit.px / 2,
          // Fade and grow in (and out) on the panel ease, over orbit.fadeMs.
          transition: `opacity ${orbit.fadeMs}ms ${FADE_EASE}, transform ${orbit.fadeMs}ms ${FADE_EASE}`,
        }}
      >
        {/* Silhouette — always full strength. */}
        <circle r={ORBIT_R} vectorEffect="non-scaling-stroke" />
        {/* Equator: the near (lower) half full, the far (upper) half dim. */}
        <path d={`M ${-ORBIT_R} 0 A ${ORBIT_R} ${EQUATOR_RY} 0 0 0 ${ORBIT_R} 0`} vectorEffect="non-scaling-stroke" />
        <path
          className="map-cursor-arc--far"
          d={`M ${-ORBIT_R} 0 A ${ORBIT_R} ${EQUATOR_RY} 0 0 1 ${ORBIT_R} 0`}
          vectorEffect="non-scaling-stroke"
        />
        <Meridian lag={0} />
        {/* A quarter-turn behind the first. */}
        <Meridian lag={0.25} late />
      </svg>
      <span className={`${READOUT} -translate-y-1/2`} style={{ right: OFFSET, top: 0 }}>
        Latitude: <span ref={lat} />
      </span>
      <span className={`${READOUT} -translate-y-1/2`} style={{ left: OFFSET, top: 0 }}>
        Longitude: <span ref={lng} />
      </span>
      <span className={`${READOUT} -translate-x-1/2`} style={{ left: 0, top: OFFSET }}>
        Zoom: <span ref={zoom} />
      </span>
    </div>
  );
});

export default MapCursor;

// One meridian as two half-arcs. The group turns (scaleX, globals.css) and
// each half fades with depth: the half on the near side of the sphere
// brightens as it swings toward the viewer and dims as it swings away, so
// the globe reads as solid rather than a flat wireframe. The far half runs
// the same fade half a turn out of step. `lag` is in turns.
function Meridian({ lag, late = false }: { lag: number; late?: boolean }) {
  const period = orbit.periodMs;
  const timing = (extra: number) => ({
    animationDuration: `${period}ms`,
    animationDelay: `${-(lag + extra) * period}ms`,
  });
  return (
    <g className={`map-cursor-meridian${late ? " map-cursor-meridian--late" : ""}`} style={timing(0)}>
      <path
        className="map-cursor-arc"
        d={`M 0 ${-ORBIT_R} A ${ORBIT_R} ${ORBIT_R} 0 0 1 0 ${ORBIT_R}`}
        vectorEffect="non-scaling-stroke"
        style={timing(0)}
      />
      <path
        className="map-cursor-arc map-cursor-arc--far"
        d={`M 0 ${-ORBIT_R} A ${ORBIT_R} ${ORBIT_R} 0 0 0 0 ${ORBIT_R}`}
        vectorEffect="non-scaling-stroke"
        style={timing(0.5)}
      />
    </g>
  );
}
