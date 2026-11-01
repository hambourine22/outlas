# Review — Iconography · 2026-11-01

**Slug:** `iconography` · **Size:** M (built from the request directly; the system contract stood in for a spec) · **Diff:** commit · **Reviewer:** Claude (UI + QA seats, same session)

## Verdict: ship
A single icon registry and renderer, a token, a Foundations chapter, and icons on every Map Legend row as asked.

## Requests covered
1. "Add iconography to the design system." → `app/ui/icons/icons.ts` (geometry, 36 glyphs in four sets), `app/ui/icons/Icon.tsx` (renderer), `iconography` token in `design-system.ts`, chapter 18 on `/design-system`, section in `DESIGN_SYSTEM.md`.
2. "Icons for all of these" (the Map Legend lists). → `LEGEND_ICON` maps every `mapLegend` key; the Transport (EV · Train · Sail) and Features (Ski … Camping) rows render their glyph at 20px.

## Construction
24-unit grid, 3–21 safe area, stroke 1.6, round caps/joins, `currentColor`, no fills but dots — the vocabulary already used by the chevrons, theme icons and the transport key, so nothing on screen changes weight. Sizes 12 · 16 · 20 · 24 are ladder rungs. Train and EV are the 16-grid transport glyphs redrawn on 24; the 16-grid originals stay for the Mapbox serialiser.

## Gate
`qa-gate.sh` — tsc ✓ · lint ✓ · tokens ✓ (LEGACY 2, pre-existing; 13 opacity-trap warnings, tracked) · isolated build ✓

## Acceptance
- [x] Every `mapLegend` key resolves to a glyph — checked in the DOM: 3 transport rows, 9 feature rows, each with an `<svg>` child.
- [x] Chapter renders rules, size ladder, four sets, map-glyph comparison, usage — screenshots at 24px in dark theme; glyphs legible at 12px in the ladder.
- [x] No hex, no new colour; icons take `--ink` (verified: `stroke="currentColor"` in rendered markup).
- [x] `Icon` with no `label` is `aria-hidden`; with `label` it is `role="img"` — by construction, see `Icon.tsx`.
- [x] Sidebar lists the chapter (18 · Iconography) under Foundations.

## Browser matrix
Dark ✓ (desktop). Light: tokens are `currentColor`, no theme-specific drawing — not separately exercised. Phone: tile grid is `grid-cols-3 → 8`, not exercised.

## Findings
- **[Minor] Call sites still draw their own SVGs** — seven files, with the same glyph duplicated up to three times. Not migrated here because those files were mid-edit in other sessions. Brief: `docs/briefs/icon-callsite-migration.md`.
- **[Nit] `splitboard` and `snowboard` lean on `transform="rotate(45)"`** — fine in SVG, but if a glyph ever needs the Mapbox serialiser path (which only understands path/rect/dot without transforms) it would need baking into path data.

## Noticed (outside this change)
- `design-system.ts` and `DESIGN_SYSTEM.md` carry another session's uncommitted motion/panel work; only the iconography hunks are in this commit.

---
Next: `/security-ops` on `iconography` — ships with the next release.
