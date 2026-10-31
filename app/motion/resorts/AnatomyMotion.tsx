"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion as M, anatomy } from "@/app/lib/design-system";
import { boxFor, silhouette, band, contours, liftLine, lerpStats, yAt, type MountainStats } from "@/app/lib/anatomy";

/* -------------------------------------------------------------------------
 * AnatomyMotion — "Anatomy of a resort". One contoured peak that reshapes
 * itself from resort to resort: the summit climbs or drops, the skiable band
 * grows contours, the width breathes, the lift rungs step. Each resort holds
 * for `motion.anatomy.dwell` and morphs over `motion.anatomy.morph`; the
 * sequence is the content layer's order, so the loop travels the ranges.
 *
 * Single source of truth — nothing here names a colour, a font or a number:
 *   data     → props, extracted on the server from the content facade
 *   geometry → app/lib/anatomy.ts (shared with the SVG primitive)
 *   timing, frame, strokes, opacities → `motion` + `anatomy` tokens
 *   colours  → semantic CSS tokens read at draw time (theme-aware)
 *   type     → next/font families via --font-vollkorn / --font-archivo / --font-geist-mono
 * ---------------------------------------------------------------------- */

export type AnatomyResort = MountainStats & { name: string; slug: string; country?: string };

const W = M.frame.w;
const H = M.frame.h;
const MARGIN = 44;                       // 4 % of the short side, to the nearest 4
const TITLE_H = 200;
const BOX = boxFor(880, 640, W / 2, 1000); // 880 px = 400 km · 640 px = 4000 m · ground at y 1000
const DWELL = M.anatomy.dwell;
const MORPH = M.anatomy.morph;
const SLOT = DWELL + MORPH;

const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

type Tokens = { canvas: string; ink: string; inkMuted: string; inkFaint: string; rule: string; ruleStrong: string; accent: string };
type Fonts = { display: string; ui: string; mono: string };

function readTokens(): Tokens {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  return { canvas: v("--canvas"), ink: v("--ink"), inkMuted: v("--ink-muted"), inkFaint: v("--ink-faint"), rule: v("--rule"), ruleStrong: v("--rule-strong"), accent: v("--accent") };
}
function readFonts(): Fonts {
  const cs = getComputedStyle(document.body);
  const fam = (name: string, fallback: string) => { const f = cs.getPropertyValue(name).trim(); return f ? `${f}, ${fallback}` : fallback; };
  return { display: fam("--font-vollkorn", "Georgia, serif"), ui: fam("--font-archivo", "system-ui, sans-serif"), mono: fam("--font-geist-mono", "ui-monospace, monospace") };
}

export default function AnatomyMotion({ resorts }: { resorts: AnatomyResort[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const armedRef = useRef<string | null>(null);
  const holdRef = useRef<number>(-1);
  const [hold, setHold] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "armed" | "recording" | "done" | "unsupported">("idle");
  const [reduced, setReduced] = useState(false);

  const seq = useMemo(() => resorts, [resorts]);
  useEffect(() => { holdRef.current = hold ? seq.findIndex((r) => r.slug === hold) : -1; }, [hold, seq]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || seq.length === 0) return;
    const ctx0 = canvas.getContext("2d");
    if (!ctx0) return;
    const ctx: CanvasRenderingContext2D = ctx0;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const S = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * S);
    canvas.height = Math.round(H * S);

    let tokens = readTokens();
    let fonts = readFonts();
    let frame = 0;
    let raf = 0;
    let prevSlotT = 0;
    let recorder: MediaRecorder | null = null;
    const start = performance.now();

    const refresh = () => { tokens = readTokens(); fonts = readFonts(); };
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", refresh);

    const font = (weight: number, size: number, family: string) => `${weight} ${size}px ${family}`;
    const text = (s: string, x: number, y: number, o: { font: string; color: string; align?: CanvasTextAlign; alpha?: number; tracking?: string; upper?: boolean }) => {
      ctx.save();
      ctx.font = o.font; ctx.fillStyle = o.color; ctx.textAlign = o.align ?? "left"; ctx.textBaseline = "alphabetic"; ctx.globalAlpha = o.alpha ?? 1;
      const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
      if ("letterSpacing" in c) c.letterSpacing = o.tracking ?? "0px";
      ctx.fillText(o.upper ? s.toUpperCase() : s, x, y);
      ctx.restore();
    };
    const stroke = (pts: [number, number][], color: string, width: number, alpha = 1, dash?: readonly number[]) => {
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; ctx.lineJoin = "round"; ctx.setLineDash(dash ? [...dash] : []);
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke(); ctx.restore();
    };
    const dot = (x: number, y: number, r: number, color: string, alpha = 1) => {
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    };
    const label = (size: number) => font(700, size, fonts.ui);
    const ui = (size: number) => font(400, size, fonts.ui);
    const mono = (size: number, weight = 400) => font(weight, size, fonts.mono);

    function draw(t: number) {
      const n = seq.length;
      const held = holdRef.current;
      let i: number, w: number;
      if (held >= 0 || mq.matches) { i = Math.max(0, held); w = 0; }
      else {
        const slot = Math.floor(t / SLOT) % n;
        const st = t % SLOT;
        i = slot;
        w = st < DWELL ? 0 : ease((st - DWELL) / MORPH);
      }
      const a = seq[i];
      const b = seq[(i + 1) % n];
      const s = w === 0 ? a : lerpStats(a, b, w);

      ctx.setTransform(S, 0, 0, S, 0, 0);
      ctx.fillStyle = tokens.canvas;
      ctx.fillRect(0, 0, W, H);

      // ---- title block
      text(`Explore · ${n} mountains`, MARGIN, MARGIN + 20, { font: label(16), color: tokens.inkMuted, tracking: "0.08em", upper: true });
      text(`${W} × ${H} · ${String(i + 1).padStart(3, "0")} / ${n}`, W - MARGIN, MARGIN + 20, { font: mono(14), color: tokens.inkFaint, align: "right" });
      text("Anatomy of a resort", MARGIN, MARGIN + 104, { font: font(700, 72, fonts.display), color: tokens.ink });
      text("height is altitude · the ink band is what you can ski · width is how much there is · rungs are lifts", MARGIN, MARGIN + 144, { font: ui(18), color: tokens.inkMuted });
      stroke([[MARGIN, TITLE_H], [W - MARGIN, TITLE_H]], tokens.rule, M.stroke.rule);

      // ---- ground + scale
      stroke([[MARGIN, BOX.ground], [W - MARGIN, BOX.ground]], tokens.rule, M.stroke.rule);
      const tick = 1000 * BOX.pxPerM;
      stroke([[MARGIN + 8, BOX.ground], [MARGIN + 8, BOX.ground - tick]], tokens.ruleStrong, M.stroke.rule);
      text("1000 m", MARGIN + 16, BOX.ground - tick + 5, { font: mono(13), color: tokens.inkFaint });
      const bar = 100 * BOX.pxPerKm;
      stroke([[W - MARGIN - 8 - bar, BOX.ground + 16], [W - MARGIN - 8, BOX.ground + 16]], tokens.ruleStrong, M.stroke.rule);
      text("100 km", W - MARGIN - 8, BOX.ground + 34, { font: mono(13), color: tokens.inkFaint, align: "right" });

      // ---- the glyph
      const foot = silhouette(s, BOX);
      stroke(foot, tokens.rule, M.stroke.rule, M.opacity.rules);
      for (const c of contours(s, BOX)) {
        const y = yAt(c.a, BOX);
        stroke([[c.x0, y], [c.x1, y]], tokens.ink, M.stroke.rule, M.opacity.rules * c.alpha);
      }
      const cap = band(s, BOX);
      stroke(cap, tokens.ink, M.stroke.line);
      const lift = liftLine(s, BOX);
      stroke([lift.from, lift.to], tokens.accent, M.stroke.leader, M.opacity.leaders, anatomy.lift.dash);
      for (const p of lift.nodes) dot(p[0], p[1], 3, tokens.accent);
      const summit: [number, number] = [BOX.cx, yAt(s.peak, BOX)];
      dot(summit[0], summit[1], 3.5, tokens.ink);

      // ---- marks on the glyph
      text(`${Math.round(s.peak)} m`, summit[0] + 12, summit[1] - 8, { font: mono(16), color: tokens.ink });
      text(`${Math.round(s.base)} m`, cap[0][0] - 10, cap[0][1] + 5, { font: mono(14), color: tokens.inkMuted, align: "right" });
      const left = foot[0][0], right = foot[foot.length - 1][0], by = BOX.ground + 44;
      stroke([[left, by - 6], [left, by], [right, by], [right, by - 6]], tokens.ruleStrong, M.stroke.rule);
      text(`${Math.round(s.terrain)} km`, (left + right) / 2, by + 20, { font: mono(14), color: tokens.inkMuted, align: "center" });
      const mid: [number, number] = [(lift.from[0] + lift.to[0]) / 2, (lift.from[1] + lift.to[1]) / 2];
      text(`${Math.round(s.lifts)} lifts`, mid[0] - 14, mid[1] - 6, { font: mono(14), color: tokens.accent, align: "right" });

      // ---- HUD: name (cross-fades through the morph) + readouts
      const nameY = 1112;
      const aAlpha = w < 0.5 ? 1 - w * 2 : 0;
      const bAlpha = w > 0.5 ? (w - 0.5) * 2 : 0;
      if (aAlpha > 0) {
        text(a.name, MARGIN, nameY, { font: font(700, 52, fonts.display), color: tokens.ink, alpha: aAlpha });
        if (a.country) text(a.country, MARGIN + measure(a.name, font(700, 52, fonts.display)) + 20, nameY, { font: label(16), color: tokens.inkFaint, tracking: "0.08em", upper: true, alpha: aAlpha });
      }
      if (bAlpha > 0) {
        text(b.name, MARGIN, nameY, { font: font(700, 52, fonts.display), color: tokens.ink, alpha: bAlpha });
        if (b.country) text(b.country, MARGIN + measure(b.name, font(700, 52, fonts.display)) + 20, nameY, { font: label(16), color: tokens.inkFaint, tracking: "0.08em", upper: true, alpha: bAlpha });
      }
      const readout = (x: number, k: string, v: string) => {
        text(k, x, 1168, { font: label(13), color: tokens.inkFaint, tracking: "0.1em", upper: true });
        text(v, x, 1208, { font: mono(32, 700), color: tokens.ink });
      };
      readout(MARGIN, "peak", `${Math.round(s.peak)} m`);
      readout(MARGIN + 200, "vertical", `${Math.round(s.peak - s.base)} m`);
      readout(MARGIN + 400, "terrain", `${Math.round(s.terrain)} km`);
      readout(MARGIN + 600, "lifts", `${Math.round(s.lifts)}`);
      readout(MARGIN + 760, "snowfall", s.snowfall !== undefined ? `${Math.round(s.snowfall)} cm` : "—");

      // ---- sequence
      const sx0 = MARGIN, sx1 = W - MARGIN, sy = H - MARGIN - 8;
      for (let k = 0; k < n; k++) {
        const x = sx0 + ((sx1 - sx0) * (k + 0.5)) / n;
        stroke([[x, sy - (k === i ? 12 : 6)], [x, sy]], k === i ? tokens.ink : tokens.rule, k === i ? M.stroke.line : M.stroke.rule);
      }
    }

    function measure(s: string, f: string) { ctx.save(); ctx.font = f; const w = ctx.measureText(s).width; ctx.restore(); return w; }

    const loop = (now: number) => {
      const t = (now - start) / 1000;
      if (frame++ % 30 === 0) refresh();
      const slotT = t % SLOT;
      if (armedRef.current && slotT < prevSlotT) {
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
          setStatus("done"); recorder = null;
        };
        recorder.start();
        setStatus("recording");
        window.setTimeout(() => recorder?.state === "recording" && recorder.stop(), M.loop * 1000);
      }
      prevSlotT = slotT;
      draw(t);
      if (!mq.matches) raf = requestAnimationFrame(loop);
    };

    Promise.all([
      document.fonts.load(font(700, 72, fonts.display)),
      document.fonts.load(font(700, 52, fonts.display)),
      document.fonts.load(font(700, 16, fonts.ui)),
      document.fonts.load(font(400, 18, fonts.ui)),
      document.fonts.load(font(400, 14, fonts.mono)),
      document.fonts.load(font(700, 32, fonts.mono)),
    ]).catch(() => undefined).then(() => { raf = requestAnimationFrame(loop); });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      scheme.removeEventListener("change", refresh);
      if (recorder?.state === "recording") recorder.stop();
    };
  }, [seq]);

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
        aria-label="Anatomy of a resort — one contoured peak that reshapes from resort to resort: height is altitude, the ink band is the skiable vertical, width is pisted terrain, the rungs are lifts."
      />
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 font-ui text-sm text-ink-muted">
          <span className="label text-ink-faint">Show</span>
          <select
            value={hold}
            onChange={(e) => setHold(e.target.value)}
            className="border border-rule bg-canvas px-3 py-2 font-ui text-sm text-ink"
          >
            <option value="">Cycle all {seq.length}</option>
            {seq.map((r) => (
              <option key={r.slug} value={r.slug}>{r.name}{r.country ? ` · ${r.country}` : ""}</option>
            ))}
          </select>
        </label>
        <span className="flex items-center gap-2">
          <span className="mr-2 font-mono text-xs text-ink-faint">
            {W} × {H} · {(DWELL + MORPH).toFixed(1)} s per resort{reduced ? " · reduced motion: one frame" : ""}
          </span>
          <button type="button" onClick={still} className="chip hover:bg-[var(--row-hover)]">Save still · PNG</button>
          {!reduced && (
            <button type="button" onClick={arm} disabled={status === "armed" || status === "recording"} className="chip hover:bg-[var(--row-hover)] disabled:opacity-50">
              {status === "armed" ? "Waiting for the next resort…" : status === "recording" ? `Recording ${M.loop} s…` : status === "unsupported" ? "Recording not supported here" : status === "done" ? `Saved · record ${M.loop} s again` : `Record ${M.loop} s`}
            </button>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

function stamp() { return new Date().toISOString().replace(/[-:]/g, "").slice(0, 15); }
function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
