"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { mapCursor, motion } from "@/app/lib/design-system";

// The map's pointer — a rust dot that reads out where it is: latitude to
// its left, longitude to its right, zoom beneath. map.tsx drives it
// imperatively from the map's mouse events, so the dot never waits on a
// React render. Hidden on devices without hover (touch has no pointer to
// replace). Over a pin, a globe of feathered orbit trails flows round the
// dot and the readouts ease outward to clear it. Tokens: mapCursor in
// design-system.ts.

export type MapCursorHandle = {
  show: (point: { x: number; y: number }) => void;
  read: (lngLat: { lat: number; lng: number }, zoom: number) => void;
  hover: (on: boolean) => void;
  hide: () => void;
};

const { dot, ink, px, gap, hoverScale, orbit, decimals } = mapCursor;
const OFFSET = px / 2 + gap;
// How far the readouts move out on hover, so they clear the globe by the
// same gap they keep from the dot.
const SHIFT = orbit.px / 2 + gap * 0.6 - OFFSET;
const FADE_EASE = motion.eases[motion.panel.ease].css;
const EASE_OUT = `${orbit.fadeMs}ms ${FADE_EASE}`;
const READOUT =
  "absolute whitespace-nowrap font-ui text-label uppercase tracking-wide tabular-nums";

// Canvas geometry: the globe plus room for the head's stroke.
const PAD = Math.ceil(orbit.head);
const SIZE = orbit.px + PAD * 2;
const R = orbit.px / 2;
const SEGMENTS = 40;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// One frame of the globe at time `t` (ms). Each orbit is an ellipse (the
// orbit seen from a little above, then tilted); its head runs round it once
// per period with a slight ease (faster on the near side, slower behind),
// and its trail is SEGMENTS short arcs drawn tail-first, each fainter and
// thinner the further it is from the head, and dimmer on the far side.
function drawGlobe(ctx: CanvasRenderingContext2D, t: number) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.save();
  ctx.translate(SIZE / 2, SIZE / 2);
  ctx.strokeStyle = dot;
  ctx.fillStyle = dot;
  ctx.lineCap = "butt";

  const span = orbit.trail * Math.PI * 2;
  for (const o of orbit.orbits) {
    const tilt = (o.tilt * Math.PI) / 180;
    const ry = R * o.squash;
    const turn = t / orbit.periodMs + o.phase;
    const head = Math.PI * 2 * (turn + 0.04 * Math.sin(Math.PI * 2 * turn));
    // Near side of the orbit is its lower half (sin > 0), seen from above.
    const near = (a: number) => orbit.depth + (1 - orbit.depth) * (Math.sin(a) + 1) / 2;

    for (let i = SEGMENTS - 1; i >= 0; i--) {
      const from = head - ((i + 1) / SEGMENTS) * span;
      const to = head - (i / SEGMENTS) * span;
      const along = (i + 0.5) / SEGMENTS; // 0 at the head, 1 at the tail
      ctx.globalAlpha = (1 - along) ** orbit.feather * near((from + to) / 2);
      ctx.lineWidth = orbit.tail + (orbit.head - orbit.tail) * (1 - along);
      ctx.beginPath();
      ctx.ellipse(0, 0, R, ry, tilt, from, to);
      ctx.stroke();
    }

    // The head itself — a bead the trail streams from.
    const hx = R * Math.cos(head);
    const hy = ry * Math.sin(head);
    ctx.globalAlpha = near(head);
    ctx.beginPath();
    ctx.arc(
      hx * Math.cos(tilt) - hy * Math.sin(tilt),
      hx * Math.sin(tilt) + hy * Math.cos(tilt),
      orbit.head * 0.7,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

const MapCursor = forwardRef<MapCursorHandle>(function MapCursor(_, ref) {
  const root = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLSpanElement>(null);
  const globe = useRef<HTMLCanvasElement>(null);
  const lat = useRef<HTMLSpanElement>(null);
  const lng = useRef<HTMLSpanElement>(null);
  const zoom = useRef<HTMLSpanElement>(null);

  // The globe animates only while it's showing, and for its fade-out.
  const frame = useRef<number | null>(null);
  const stopAt = useRef(0);

  useEffect(() => {
    const canvas = globe.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.getContext("2d")?.scale(dpr, dpr);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const run = () => {
    const ctx = globe.current?.getContext("2d");
    if (!ctx) return;
    if (reducedMotion()) {
      drawGlobe(ctx, 0);
      return;
    }
    if (frame.current !== null) return;
    const tick = (now: number) => {
      drawGlobe(ctx, now);
      frame.current = stopAt.current && now > stopAt.current ? null : requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

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
        // data-on fades and grows the globe in (globals.css); the readouts
        // slide out to clear it on the same ease.
        globe.current?.toggleAttribute("data-on", on);
        if (lat.current?.parentElement) lat.current.parentElement.style.translate = on ? `${-SHIFT}px 0` : "";
        if (lng.current?.parentElement) lng.current.parentElement.style.translate = on ? `${SHIFT}px 0` : "";
        if (zoom.current?.parentElement) zoom.current.parentElement.style.translate = on ? `0 ${SHIFT}px` : "";
        if (on) {
          stopAt.current = 0;
          run();
        } else {
          stopAt.current = performance.now() + orbit.fadeMs;
        }
      },
      hide() {
        if (root.current) root.current.style.visibility = "hidden";
      },
    }),
    // run reads only refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <canvas
        ref={globe}
        className="map-cursor-orbit absolute"
        style={{
          width: SIZE,
          height: SIZE,
          left: -SIZE / 2,
          top: -SIZE / 2,
          // Fade and grow in (and out) on the panel ease, over orbit.fadeMs.
          transition: `opacity ${EASE_OUT}, transform ${EASE_OUT}`,
        }}
      />
      <span
        className={`${READOUT} -translate-y-1/2`}
        style={{ right: OFFSET, top: 0, transition: `translate ${EASE_OUT}` }}
      >
        Latitude: <span ref={lat} />
      </span>
      <span
        className={`${READOUT} -translate-y-1/2`}
        style={{ left: OFFSET, top: 0, transition: `translate ${EASE_OUT}` }}
      >
        Longitude: <span ref={lng} />
      </span>
      <span
        className={`${READOUT} -translate-x-1/2`}
        style={{ left: 0, top: OFFSET, transition: `translate ${EASE_OUT}` }}
      >
        Zoom: <span ref={zoom} />
      </span>
    </div>
  );
});

export default MapCursor;
