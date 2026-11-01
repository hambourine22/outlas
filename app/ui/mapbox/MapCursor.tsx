"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { mapCursor } from "@/app/lib/design-system";

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

const { dot, ink, px, gap, hoverScale, decimals } = mapCursor;
const OFFSET = px / 2 + gap;
const READOUT =
  "absolute whitespace-nowrap font-ui text-label uppercase tracking-wide tabular-nums";

const MapCursor = forwardRef<MapCursorHandle>(function MapCursor(_, ref) {
  const root = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLSpanElement>(null);
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
