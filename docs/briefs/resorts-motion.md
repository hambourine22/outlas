# Anatomy of a mountain — resorts motion graphic

**Slug:** `resorts-motion` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** M

## Problem
The resort dataset now carries altitude, size and position for 100 resorts, but nothing on the site shows the shape of it. The art direction already exists — the "Anatomy of distance travelled" strata sheet (numbered layers, hairlines, dashed leaders, a sheet that folds into an oblique stack, a playhead, 4:5 export) — but in another project's palette and type.

## Why now
Stats landed today (`resort-stats-pack`); the art direction brief arrived with a full spec of the reference piece.

## Success signal
`/motion/resorts` plays an eight-second loop of three strata (space · altitude · size) over the 100 resorts, in both themes, with every number coming from `resorts.ts` and every colour, font, duration and weight coming from the design system; a 4:5 clip or still can be saved from the page.

## In scope
- Server-side extraction of peak, base (peak − vertical), terrain km, lifts, lon/lat via the content facade.
- `motion` tokens in `design-system.ts` (frame, loop, morph, draw-in, ease, view, lean, strokes, opacities, strata, export).
- Canvas piece that reads semantic CSS tokens at draw time (theme-aware) and next/font families.
- Record-one-loop (MediaRecorder) and save-still (PNG) from the page.
- Nav entry under Explore.

## Out of scope
- three.js / a dependency. The oblique strata are a 2D projection; nothing here needs WebGL.
- The reference's bilingual (uk · en) pairing — that is the other project's convention, not Oütlas voice.
- Server-side video rendering (no ffmpeg on the box); export is in-browser.
- A Motion chapter on `/design-system` — follow-up once the tokens settle.

## Seats
- [x] `/ux` — folded into this brief: states are the four phases (draw-in, fold, sweep, unfold) plus reduced-motion (one still frame).
- [x] `/ui` — runs
- [ ] `/review-qa` — runs
- [ ] `/security-ops` — deploy on request only

## Links
Reference spec pasted in session (three.js "Anatomy of distance travelled", ref 1000·С002). Copy style: `docs/COPY_STYLE.md`.
