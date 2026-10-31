"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion as M, dataviz } from "@/app/lib/design-system";

/* -------------------------------------------------------------------------
 * ResortsMotion — "Anatomy of a mountain". 100 resorts drawn as three strata
 * (01 space · 02 altitude · 03 size) that lie flat as one sheet, fold into an
 * oblique stack, get swept by a playhead that lights each resort in turn, and
 * fold back. Eight seconds, on a loop, framed 4:5.
 *
 * Single source of truth — nothing in this file names a colour, a font or a
 * duration:
 *   data     → props, extracted on the server from app/content/map/resorts.ts
 *   timing, frame, view, lean, stroke weights, opacities → `motion` tokens
 *   colours  → the semantic CSS tokens (--canvas, --ink, --rule, --accent …)
 *              read at draw time, so the piece follows light / dark / system
 *   emphasis → dataviz.series "rust" — legible on snow and on carbon
 *   type     → next/font families via --font-vollkorn / --font-archivo /
 *              --font-geist-mono, resolved from <body> at mount
 * ---------------------------------------------------------------------- */

export type MotionResort = {
  name: string;
  country?: string;
  lon: number;
  lat: number;
  peak: number;    // m
  base: number;    // m — peak minus vertical drop
  terrain: number; // km of pisted terrain
  lifts: number;
};

type Pt = [number, number];

// ---- Frame layout (px on the 1080 × 1350 frame; every value is a multiple of 4)
const W = M.frame.w;
const H = M.frame.h;
const MARGIN = 44;                 // 4 % of the short side, to the nearest 4 (grid token)
const PW = W - MARGIN * 2;         // plane width — 992
const PH = 240;                    // plane height on the sheet
const GAP = 32;                    // gap between strata on the sheet
const TITLE_H = 200;
const HUD_H = 120;
const SHEET_Y0 = 324;              // strata centred in the band between title and HUD
const STACK_Y0 = 360;
const SU = 0.9;                    // horizontal scale of a slab in the stack
const ZGAP = 240;                  // vertical separation of slabs in the stack
const RISE = 160;                  // tallest mark standing out of a slab

// ---- Data scales — derived from the data, so a taller or bigger resort
// re-grids the planes instead of overflowing them.
type Scale = { altMax: number; terMax: number; SY: number; SZ: number; ST: number; STZ: number };
function scaleFor(rows: MotionResort[]): Scale {
  const altMax = Math.max(1000, Math.ceil(Math.max(...rows.map((r) => r.peak)) / 1000) * 1000);
  const terMax = Math.max(100, Math.ceil(Math.max(...rows.map((r) => r.terrain)) / 100) * 100);
  return {
    altMax, terMax,
    SY: PH / altMax,    // sheet px per metre
    SZ: RISE / altMax,  // stack px per metre
    ST: PH / terMax,    // sheet px per km
    STZ: RISE / terMax, // stack px per km
  };
}

// ---- Timeline (seconds), all from the motion tokens
const T_DRAW = M.drawIn;
const T_FOLD = T_DRAW;
const T_SWEEP = T_FOLD + M.morph;
const T_UNFOLD = M.loop - M.morph;

// power2.inOut — the tokens name it; the maths lives here once.
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: Pt, b: Pt, w: number): Pt => [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w];

// ---- Projections. A point (u, v) on plane k; w blends sheet (0) → stack (1).
const sheetPt = (u: number, v: number, k: number): Pt => [MARGIN + u, SHEET_Y0 + k * (PH + GAP) + v];
const stackPt = (u: number, v: number, k: number, rise = 0): Pt => [
  MARGIN + u * SU + (PH - v) * M.view.oblique.shear,
  STACK_Y0 + k * ZGAP + v * M.view.oblique.squash - rise,
];
// a mark that lies in the plane
const inPlane = (u: number, v: number, k: number, w: number): Pt => lerp(sheetPt(u, v, k), stackPt(u, v, k), w);
// a mark that stands up: in-plane height on the sheet, a screen-vertical rise in the stack
const standing = (u: number, k: number, hSheet: number, rStack: number, w: number): Pt =>
  lerp(sheetPt(u, PH - hSheet, k), stackPt(u, PH, k, rStack), w);

type Tokens = {
  canvas: string; ink: string; inkMuted: string; inkFaint: string;
  rule: string; ruleStrong: string; accent: string; emphasis: string;
};
type Fonts = { display: string; ui: string; mono: string };

function readTokens(): Tokens {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  return {
    canvas: v("--canvas"), ink: v("--ink"), inkMuted: v("--ink-muted"), inkFaint: v("--ink-faint"),
    rule: v("--rule"), ruleStrong: v("--rule-strong"), accent: v("--accent"),
    emphasis: dataviz.series.find((s) => s.key === "rust")?.stroke ?? v("--accent"),
  };
}

function readFonts(): Fonts {
  const cs = getComputedStyle(document.body);
  const fam = (name: string, fallback: string) => {
    const f = cs.getPropertyValue(name).trim();
    return f ? `${f}, ${fallback}` : fallback;
  };
  return {
    display: fam("--font-vollkorn", "Georgia, serif"),
    ui: fam("--font-archivo", "system-ui, sans-serif"),
    mono: fam("--font-geist-mono", "ui-monospace, monospace"),
  };
}

type Row = MotionResort & { u: number; v: number };

export default function ResortsMotion({ resorts }: { resorts: MotionResort[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const armedRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"idle" | "armed" | "recording" | "done" | "unsupported">("idle");
  const [reduced, setReduced] = useState(false);

  // Sort by longitude so every stratum shares one horizontal axis and the
  // playhead sweeps west → east. Space keeps latitude as its vertical.
  const rows = useMemo<Row[]>(() => {
    const lons = resorts.map((r) => r.lon);
    const lats = resorts.map((r) => r.lat);
    const lonMin = Math.min(...lons), lonMax = Math.max(...lons);
    const latMin = Math.min(...lats), latMax = Math.max(...lats);
    return [...resorts]
      .sort((a, b) => a.lon - b.lon)
      .map((r) => ({
        ...r,
        u: ((r.lon - lonMin) / (lonMax - lonMin || 1)) * PW,
        v: ((latMax - r.lat) / (latMax - latMin || 1)) * PH,
      }));
  }, [resorts]);

  const bounds = useMemo(() => {
    const lons = resorts.map((r) => r.lon), lats = resorts.map((r) => r.lat);
    return { lonMin: Math.min(...lons), lonMax: Math.max(...lons), latMin: Math.min(...lats), latMax: Math.max(...lats) };
  }, [resorts]);

  const highest = useMemo(() => rows.reduce((a, b) => (b.peak > a.peak ? b : a), rows[0]), [rows]);
  const biggest = useMemo(() => rows.reduce((a, b) => (b.terrain > a.terrain ? b : a), rows[0]), [rows]);
  const sc = useMemo(() => scaleFor(rows.length ? rows : [{ name: "", lon: 0, lat: 0, peak: 1000, base: 0, terrain: 100, lifts: 0 }]), [rows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || rows.length === 0) return;
    const ctx0 = canvas.getContext("2d");
    if (!ctx0) return;
    const ctx: CanvasRenderingContext2D = ctx0; // narrowed once; closures below keep the type
    const { SY, SZ, ST, STZ, altMax, terMax } = sc;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    // Backing store: the frame × device pixel ratio (capped at 2 — the 2160
    // export size). Drawing happens in frame px via the transform.
    const S = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * S);
    canvas.height = Math.round(H * S);

    let tokens = readTokens();
    let fonts = readFonts();
    let frame = 0;
    let raf = 0;
    let prevT = 0;
    let recorder: MediaRecorder | null = null;
    const start = performance.now();

    const refreshTokens = () => { tokens = readTokens(); fonts = readFonts(); };
    const themeObserver = new MutationObserver(refreshTokens);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", refreshTokens);

    const font = (weight: number, size: number, family: string) => `${weight} ${size}px ${family}`;
    const text = (
      s: string, x: number, y: number,
      o: { font: string; color: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; alpha?: number; tracking?: string; upper?: boolean },
    ) => {
      ctx.save();
      ctx.font = o.font;
      ctx.fillStyle = o.color;
      ctx.textAlign = o.align ?? "left";
      ctx.textBaseline = o.baseline ?? "alphabetic";
      ctx.globalAlpha = o.alpha ?? 1;
      const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
      if ("letterSpacing" in c) c.letterSpacing = o.tracking ?? "0px";
      ctx.fillText(o.upper ? s.toUpperCase() : s, x, y);
      ctx.restore();
    };
    const line = (a: Pt, b: Pt, color: string, width: number, alpha = 1, dash?: readonly number[]) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = alpha;
      ctx.setLineDash(dash ? [...dash] : []);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
      ctx.restore();
    };
    const dot = (p: Pt, r: number, color: string, alpha = 1, ring = false) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
      if (ring) { ctx.strokeStyle = color; ctx.lineWidth = M.stroke.line; ctx.stroke(); }
      else { ctx.fillStyle = color; ctx.fill(); }
      ctx.restore();
    };

    const label = (size: number) => font(700, size, fonts.ui);
    const uiText = (size: number) => font(400, size, fonts.ui);
    const mono = (size: number, weight = 400) => font(weight, size, fonts.mono);

    function draw(t: number) {
      // phase weights
      const w = t < T_FOLD ? 0
        : t < T_SWEEP ? ease((t - T_FOLD) / M.morph)
        : t < T_UNFOLD ? 1
        : 1 - ease((t - T_UNFOLD) / M.morph);
      const p = t < T_DRAW ? ease(t / T_DRAW) : 1;
      const sweep = t >= T_SWEEP && t < T_UNFOLD ? (t - T_SWEEP) / (T_UNFOLD - T_SWEEP) : null;

      ctx.setTransform(S, 0, 0, S, 0, 0);
      ctx.fillStyle = tokens.canvas;
      ctx.fillRect(0, 0, W, H);

      // ---- title block
      text(`Explore · ${rows.length} resorts`, MARGIN, MARGIN + 20, { font: label(16), color: tokens.inkMuted, tracking: "0.08em", upper: true });
      text(`${W} × ${H} · ${M.loop} s · loop`, W - MARGIN, MARGIN + 20, { font: mono(14), color: tokens.inkFaint, align: "right" });
      text("Anatomy of a mountain", MARGIN, MARGIN + 104, { font: font(700, 72, fonts.display), color: tokens.ink });
      text("where they are · how high they go · how much there is to ride", MARGIN, MARGIN + 144, { font: uiText(18), color: tokens.inkMuted });
      line([MARGIN, TITLE_H], [W - MARGIN, TITLE_H], tokens.rule, M.stroke.rule, 1);

      // ---- strata
      const stagger = (i: number) => clamp01((p * (rows.length + 12) - i) / 12);
      const up = sweep === null ? null : sweep * PW;
      let lit = -1;
      if (up !== null) for (let i = 0; i < rows.length; i++) if (rows[i].u <= up) lit = i;

      for (let k = 0; k < 3; k++) {
        const S0 = M.strata[k];
        const c0 = inPlane(0, 0, k, w), c1 = inPlane(PW, 0, k, w), c2 = inPlane(PW, PH, k, w), c3 = inPlane(0, PH, k, w);

        // plane fill + edges
        ctx.save();
        ctx.globalAlpha = M.opacity.cells * p;
        ctx.fillStyle = tokens.ink;
        ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(c3[0], c3[1]); ctx.closePath(); ctx.fill();
        ctx.restore();
        const edge = (a: Pt, b: Pt) => line(a, lerp(a, b, p), tokens.rule, M.stroke.rule, M.opacity.rules);
        edge(c0, c1); edge(c1, c2); edge(c3, c2); edge(c0, c3);

        // plane title — sits at the far-left corner, follows the fold
        const tl = inPlane(0, -14, k, w);
        text(`${S0.n} · ${S0.title}`, tl[0], tl[1], { font: label(20), color: tokens.ink, tracking: "0.08em", upper: true, alpha: p });
        const tr = inPlane(PW, -14, k, w);
        text(S0.sub, tr[0], tr[1], { font: uiText(16), color: tokens.inkMuted, align: "right", alpha: p });

        if (k === 0) {
          // graticule
          for (const lat of [60, 30, 0, -30]) {
            if (lat > bounds.latMax || lat < bounds.latMin) continue;
            const v = ((bounds.latMax - lat) / (bounds.latMax - bounds.latMin)) * PH;
            line(inPlane(0, v, k, w), inPlane(PW * p, v, k, w), tokens.rule, M.stroke.rule, M.opacity.grid, M.stroke.gridDash);
            const lp = inPlane(8, v - 6, k, w);
            text(`${Math.abs(lat)}°${lat < 0 ? "S" : lat === 0 ? "" : "N"}`, lp[0], lp[1], { font: mono(13), color: tokens.inkFaint, alpha: p });
          }
          for (const lon of [-120, -60, 0, 60, 120]) {
            if (lon < bounds.lonMin || lon > bounds.lonMax) continue;
            const u = ((lon - bounds.lonMin) / (bounds.lonMax - bounds.lonMin)) * PW;
            line(inPlane(u, 0, k, w), inPlane(u, PH * p, k, w), tokens.rule, M.stroke.rule, M.opacity.grid, M.stroke.gridDash);
            const lp = inPlane(u + 6, PH - 8, k, w);
            text(`${Math.abs(lon)}°${lon < 0 ? "W" : lon === 0 ? "" : "E"}`, lp[0], lp[1], { font: mono(13), color: tokens.inkFaint, alpha: p });
          }
          rows.forEach((r, i) => {
            const a = M.opacity.marks * stagger(i);
            if (a <= 0) return;
            const pt = inPlane(r.u, r.v, k, w);
            dot(pt, 3.5, i === lit ? tokens.emphasis : tokens.accent, a);
            if (i === lit) dot(pt, 8, tokens.emphasis, 1, true);
          });
        }

        if (k === 1) {
          for (let m = 1000; m < altMax; m += 1000) {
            line(standing(0, k, m * SY, m * SZ, w), standing(PW * p, k, m * SY, m * SZ, w), tokens.rule, M.stroke.rule, M.opacity.grid, M.stroke.gridDash);
            const lp = standing(8, k, m * SY + 6, m * SZ + 6, w);
            text(`${m} m`, lp[0], lp[1], { font: mono(13), color: tokens.inkFaint, alpha: p });
          }
          rows.forEach((r, i) => {
            const a = stagger(i);
            if (a <= 0) return;
            const foot = inPlane(r.u, PH, k, w);
            const base = standing(r.u, k, r.base * SY, r.base * SZ, w);
            const top = standing(r.u, k, r.peak * SY, r.peak * SZ, w);
            const isLit = i === lit;
            line(foot, base, tokens.rule, M.stroke.rule, M.opacity.rules * a);
            line(base, top, isLit ? tokens.emphasis : tokens.accent, isLit ? M.stroke.line * 1.5 : M.stroke.line, M.opacity.marks * a);
            dot(top, isLit ? 3.5 : 2.5, isLit ? tokens.emphasis : tokens.accent, a);
          });
          // Notes sit in the plane's top-right corner rather than on the bar —
          // the tallest bar reaches the top edge, where the plane title lives.
          const hp = inPlane(PW - 8, 20, k, w);
          text(`highest · ${highest.name} · ${highest.peak} m`, hp[0], hp[1], { font: uiText(14), color: tokens.inkMuted, align: "right", alpha: p });
        }

        if (k === 2) {
          for (let km = 100; km < terMax; km += 100) {
            line(standing(0, k, km * ST, km * STZ, w), standing(PW * p, k, km * ST, km * STZ, w), tokens.rule, M.stroke.rule, M.opacity.grid, M.stroke.gridDash);
            const lp = standing(8, k, km * ST + 6, km * STZ + 6, w);
            text(`${km} km`, lp[0], lp[1], { font: mono(13), color: tokens.inkFaint, alpha: p });
          }
          rows.forEach((r, i) => {
            const a = stagger(i);
            if (a <= 0) return;
            const foot = inPlane(r.u, PH, k, w);
            const top = standing(r.u, k, r.terrain * ST, r.terrain * STZ, w);
            const isLit = i === lit;
            line(foot, top, isLit ? tokens.emphasis : tokens.accent, isLit ? M.stroke.line * 1.5 : M.stroke.line, M.opacity.marks * a);
            line([top[0] - 3, top[1]], [top[0] + 3, top[1]], isLit ? tokens.emphasis : tokens.accent, M.stroke.line, a);
          });
          const bp = inPlane(PW - 8, 20, k, w);
          text(`most · ${biggest.name} · ${biggest.terrain} km`, bp[0], bp[1], { font: uiText(14), color: tokens.inkMuted, align: "right", alpha: p });
        }
      }

      // ---- playhead + leader
      if (up !== null) {
        line(inPlane(up, 0, 0, w), inPlane(up, PH, 2, w), tokens.ink, M.stroke.line, M.opacity.playhead);
        if (lit >= 0) {
          const r = rows[lit];
          const from = standing(r.u, 1, r.peak * SY, r.peak * SZ, w);
          const right = r.u < PW * 0.62;
          const len = 120;
          const rad = (M.lean * Math.PI) / 180;
          const to: Pt = [from[0] + (right ? 1 : -1) * Math.cos(rad) * len, from[1] - Math.sin(rad) * len];
          line(from, to, tokens.ink, M.stroke.leader, M.opacity.leaders, M.stroke.leaderDash);
          const tx = to[0] + (right ? 8 : -8);
          text(r.name, tx, to[1] - 8, { font: label(18), color: tokens.ink, align: right ? "left" : "right", tracking: "0.06em", upper: true });
          text(`${r.peak} m · ${r.terrain} km · ${r.lifts} lifts${r.country ? " · " + r.country : ""}`, tx, to[1] + 14, { font: mono(15), color: tokens.inkMuted, align: right ? "left" : "right" });
        }
      }

      // ---- HUD
      const passed = up === null ? rows.length : lit + 1;
      const seen = rows.slice(0, Math.max(passed, 0));
      const hi = seen.reduce((a, b) => Math.max(a, b.peak), 0);
      const big = seen.reduce((a, b) => Math.max(a, b.terrain), 0);
      const hudY = H - HUD_H + 24;
      line([MARGIN, H - HUD_H], [W - MARGIN, H - HUD_H], tokens.rule, M.stroke.rule, 1);
      const readout = (x: number, k: string, v: string) => {
        text(k, x, hudY + 8, { font: label(13), color: tokens.inkFaint, tracking: "0.1em", upper: true });
        text(v, x, hudY + 52, { font: mono(36, 700), color: tokens.ink });
      };
      readout(MARGIN, "resorts", String(passed).padStart(3, "0"));
      readout(MARGIN + 288, "highest peak", `${hi} m`);
      readout(MARGIN + 576, "most terrain", `${big} km`);
      text(`1 px ≈ ${Math.round(1 / SY)} m · 1 px ≈ ${(1 / ST).toFixed(2)} km · sheet scale`, W - MARGIN, hudY + 52, { font: mono(13), color: tokens.inkFaint, align: "right" });
    }

    const loop = (now: number) => {
      const t = mq.matches ? T_SWEEP + (T_UNFOLD - T_SWEEP) * 0.5 : ((now - start) / 1000) % M.loop;
      if (frame++ % 30 === 0) refreshTokens();

      // Start a recording exactly on the loop boundary so the clip is one journey.
      if (armedRef.current && t < prevT) {
        const mime = armedRef.current;
        armedRef.current = null;
        const stream = canvas.captureStream(M.export.fps);
        const bps = Math.min(40e6, Math.round(canvas.width * canvas.height * M.export.fps * 0.3));
        const chunks: BlobPart[] = [];
        recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bps });
        recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
        recorder.onstop = () => {
          const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
          save(new Blob(chunks, { type: mime }), `outlas-anatomy-4x5-${canvas.width}x${canvas.height}-${stamp()}.${ext}`);
          setStatus("done");
          recorder = null;
        };
        recorder.start();
        setStatus("recording");
        window.setTimeout(() => recorder?.state === "recording" && recorder.stop(), M.loop * 1000);
      }
      prevT = t;

      draw(t);
      if (!mq.matches) raf = requestAnimationFrame(loop);
    };

    // Make sure the three faces are resident before the first frame — canvas
    // text does not trigger font loading on its own.
    Promise.all([
      document.fonts.load(font(700, 72, fonts.display)),
      document.fonts.load(font(700, 20, fonts.ui)),
      document.fonts.load(font(400, 16, fonts.ui)),
      document.fonts.load(font(400, 14, fonts.mono)),
      document.fonts.load(font(700, 36, fonts.mono)),
    ]).catch(() => undefined).then(() => { raf = requestAnimationFrame(loop); });

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      scheme.removeEventListener("change", refreshTokens);
      if (recorder?.state === "recording") recorder.stop();
    };
  }, [rows, bounds, highest, biggest, sc]);

  function arm() {
    const mime = M.export.mimes.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m));
    if (!mime) { setStatus("unsupported"); return; }
    armedRef.current = mime;
    setStatus("armed");
  }

  function still() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((b) => b && save(b, `outlas-anatomy-4x5-${canvas.width}x${canvas.height}-${stamp()}.png`), "image/png");
  }

  return (
    <figure className="m-0">
      <canvas
        ref={canvasRef}
        className="block w-full border border-rule bg-canvas"
        style={{ aspectRatio: `${W} / ${H}` }}
        role="img"
        aria-label="Anatomy of a mountain — 100 resorts drawn as three strata: where they are, how high they go, how much there is to ride. An eight-second loop."
      />
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-xs text-ink-faint">
          {W} × {H} · {M.loop} s · {M.export.fps} fps
          {reduced ? " · reduced motion: showing one frame" : ""}
        </span>
        <span className="flex items-center gap-2">
          <button type="button" onClick={still} className="chip hover:bg-[var(--row-hover)]">
            Save still · PNG
          </button>
          {!reduced && (
            <button
              type="button"
              onClick={arm}
              disabled={status === "armed" || status === "recording"}
              className="chip hover:bg-[var(--row-hover)] disabled:opacity-50"
            >
              {status === "armed" ? "Waiting for the loop…" : status === "recording" ? "Recording 8 s…" : status === "unsupported" ? "Recording not supported here" : status === "done" ? "Saved · record again" : "Record one loop"}
            </button>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
