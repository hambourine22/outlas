# Review — Anatomy of a mountain (resorts motion) · 2026-10-31

**Slug:** `resorts-motion` · **Brief:** `docs/briefs/resorts-motion.md` · **Diff:** working tree → commit · **Reviewer:** Claude (UI + QA seats, same session)

## Verdict: ship
`/motion/resorts` plays the eight-second loop in both themes; every number comes from the content layer and every colour, font, duration and weight from the design system. Record-one-loop and save-still work in this browser (MP4 `avc1` available).

## Acceptance (from the brief's success signal)
- [x] Three strata (01 space · 02 altitude · 03 size) over the resorts — 106 at review time; the count, the scales and the grids are derived from the data, so the next resort doesn't overflow a plane.
- [x] Sheet → oblique stack → playhead sweep west→east (each resort lit with a dashed leader: name · peak m · terrain km · lifts · country) → fold back; loop. Phases from `motion.drawIn` / `motion.morph` / `motion.loop`.
- [x] Numbers: extracted server-side in `app/motion/resorts/page.tsx` from `getMapData()` (Postgres first, `resorts.ts` fallback) — peak, base = peak − vertical, terrain km, lifts, lon/lat. Nothing typed into the piece.
- [x] Tokens: `motion` in `app/lib/design-system.ts` (frame 1080 × 1350, loop 8 s, morph 1.6 s, draw-in 1.2 s, ease power2.inOut, oblique view 0.42 / 0.3, lean 60°, strokes 1 / 0.5 / 0.75 dashed, opacities, strata copy, export sizes + mimes).
- [x] Colour: `--canvas / --ink / --ink-muted / --ink-faint / --rule / --accent` read at draw time; theme switch and `prefers-color-scheme` re-read live; one emphasis from `dataviz.series` (rust). `grep` on the new files: no hex, no `gray-*`, no `rounded-lg+`, no `shadow-*`.
- [x] Type: Vollkorn (title), Archivo Narrow (labels, uppercase, tracked), Geist Mono (numerals) resolved from the `next/font` variables on `<body>`; faces preloaded with `document.fonts.load` before the first frame.
- [x] Layout on the Power-of-4 ladder: margin 44 (4 % of the short side → nearest 4), plane 240, gap 32, title 200, HUD 120.
- [x] Export: `canvas.captureStream` + `MediaRecorder`, first supported of the token mime list; starts on the loop boundary so a clip is exactly one journey; backing store = frame × DPR (2160 × 2700 on a 2× display — one of the token export sizes). PNG still via `toBlob`.
- [x] Reduced motion: one still frame mid-sweep; record button hidden.
- [x] Nav: Explore · 03 · Anatomy of a mountain; page wrapped in `AppShell`.

## Gate
`qa-gate.sh` — typecheck ✓ · lint ✓ (one pre-existing warning in a sibling's untracked `FileDropZone.tsx`) · tokens ✓ (LEGACY: 2 in `app/ui/sidebar.css`) · **isolated `next build` ✓** (17 static pages).

## Browser matrix
| | Desktop (dev server :3200) |
|---|---|
| Dark | sheet ✓ · stack + playhead + leader ✓ · HUD counts ✓ |
| Light | sheet ✓ — snow canvas, carbon ink, pine marks |
| System | tokens re-read on `prefers-color-scheme` change (observer in code; not separately exercised) |
Console: the only error during development was React's "dependency array changed size" from a hot reload while the effect's deps were edited; a fresh tab is clean. Fonts: `document.fonts.status === "loaded"`, family `__vollkorn_…` resolved.

## Findings
- **[Minor, fixed in review]** The "highest · …" note rode on Breckenridge's bar, which reaches the plane's top edge and collided with the plane title. Notes now sit in each plane's top-right corner.
- **[Minor, fixed in review]** "100 resorts" was hard-coded in the eyebrow and a token sub while the content layer had grown to 106; count and scales now derive from the data.
- **[Nit]** 1080-wide frame renders at 670 CSS px in the column — crisp on 2× (2160 backing); on a 1× display the piece is drawn at frame size, so no upscaling either way.

## Noticed (outside this change)
- No Motion chapter on `/design-system` yet — the `motion` token is documented only in code and `docs/DESIGN_SYSTEM.md` has no section. XS brief: table of the token + a link to the piece.
- The reference's bilingual (uk · en) pairing was deliberately not carried over; Oütlas pairs "eyebrow · label" with a middle dot instead.

---
Next: `/security-ops` on `resorts-motion` — deploy on request.

---

# Review — pivot to Anatomy of a resort · 2026-10-31, later

**Change:** strata piece replaced by one morphing peak glyph; `app/lib/anatomy.ts` (geometry), `app/ui/ResortAnatomy.tsx` (SVG primitive), `app/motion/resorts/AnatomyMotion.tsx` (canvas), design-system chapter 17 · Anatomy, `anatomy` token, docs.

## Verdict: ship-with-fixes
Built and verified in the browser (dark + light; The Lecht and Chamonix in the loop; chapter 17 renders Cairngorm · Zermatt · Whistler with the encoding table). tsc ✓ · token drift ✓ · lint on *my* files ✓. The gate's lint/build failure is a sibling's uncommitted `<a href="/">` (no-html-link-for-pages), not in this commit. Fixes left: fresh-tab console check; label crowding on very small resorts (base / lifts labels touch); remove `ResortsMotion` references in older notes.

## Acceptance
- [x] One glyph per resort, same fixed domains everywhere (4000 m × 400 km) — primitive and canvas share `anatomy.ts`.
- [x] Encodings: height = peak; ink band = base → peak with contours every 200 m, foot faint; width = pisted km; rungs = lifts on the lift line; readouts = peak, vertical, terrain, lifts, snowfall.
- [x] Motion: dwell 1.6 s, morph 0.8 s, power2.inOut; contours fade in/out rather than pop; name cross-fades; readouts count.
- [x] Non-mountains (snowdomes, cable parks) are excluded from the mountain form and counted on the page; reserved kinds listed from the token.
- [x] Hold a single resort via the select; record 8 s; save still; reduced motion = one frame.
- [x] Design-system chapter shows Cairngorm · Zermatt · Whistler Blackcomb side by side + the encoding table from `anatomy.encodings`.
- [x] Nav: Explore · 03 · Anatomy of a resort; Data · 17 · Anatomy.

---

# Review — surf form · 2026-11-01

Surf built as the reflected mountain: `anatomy.surf` token (5000 m × 5 km, contour 500 m, rung 1,000 people); `anatomy.ts` gains `dir` on the box plus `trough / troughContours / shoreRungs`; `ResortAnatomy` takes `kind="surf"`; three curated spots in `surf.ts`, exported through the facade; chapter 17 adds the surf trio and the encoding table marks surf built. **Verdict: ship.** tsc ✓ · lint ✓ (sibling warning only) · token drift ✓ · no hex in new files. Browser (dark, dev :3200): chapter 17 shows the mountain trio above the line and the surf trio below it — Nazaré 5000 m / 2.5 km / ≈10 k, Hossegor 3000 m / 4 km / ≈3.8 k, Thurso 80 m / 2 km / ≈7.9 k — same scale, legible contrast; encoding table marks surf built. Light theme and the motion page not re-exercised (no surf in the motion sequence yet — follow-up).
