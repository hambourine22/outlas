# Review — Map pin rings · 2026-10-31

**Slug:** `map-pin-rings` · **Size:** S (no spec; intent in the commit) · **Diff:** working tree → commit · **Reviewer:** Claude (UI + QA seats, same session)

## Verdict: ship
Pins render sharp at every zoom as solid fills with no outline — a ring was tried at 2px and 1.5px and withdrawn on request; the spec lives in `mapPins` and is documented on the design-system page and in `docs/DESIGN_SYSTEM.md`.

## Requests covered
1. "Pins render a bit soft — improve sharpness." Cause: `circle-stroke-width: 1` at 40 % alpha is entirely Mapbox's 1px anti-alias fringe, so the edge had no line in it; light fills (glacier, sand) had nothing to define them against light terrain. Fix: opaque 2px ring per category, radius stepped with zoom (5 → 7 → 9px) so the world view doesn't blob.
2. "Yellow outline on green resort pins." Resorts: pine fill, **sand** ring.
3. "Lighter outline for repairs." Repairs: rust fill, **snow** ring — the repair-surface pairing.
4. "Reduce the stroke on the outline." Ring width 2px → **1.5px** via the `mapPins.ring.width` token; every key dot now reads `CATEGORY_RING_WIDTH` instead of a hard-coded `border-2`, so map and keys moved together. 1px was ruled out: opaque 1px sinks back into the anti-alias band on standard-density screens — the original softness.
5. "Changed my mind — just the colour, no outline." Ring removed entirely: `circle-stroke-width: 0`, no `ring` in the token, `CATEGORY_RING` / `CATEGORY_RING_WIDTH` deleted, every key dot fill-only. The sidebar key's filtered-out state becomes the fill at 30 % (a hollow ring no longer exists to show). Zoom-stepped radius kept — that is the part of the sharpness fix that never depended on a stroke.
The ring rule (*the ring is the ink that would sit on that fill*) is retired with the outline; it stays here as the record of what was tried.

## Gate
`tsc --noEmit` ✓ · `next lint` ✓ · `check-tokens.mjs` ✓ (LEGACY: 2 in `app/ui/sidebar.css`, pre-existing) · build – skipped locally (dev server held `.next/`); Vercel builds on deploy.

## Acceptance (derived from the requests)
- [x] Pin edges read as a line at world view and at z4 — browser zoom on Europe cluster, before/after.
- [x] Resort pins show a sand ring; repair pins a snow ring; rentals/guides a carbon ring — map, sidebar key, provider table, preview-sidebar fallback dot all read from `CATEGORY_RING`.
- [x] No off-brand colour introduced; `CATEGORY_COLOUR` now derives from `mapPins` in `design-system.ts` (single source).
- [x] Design-system page: Map Legend chapter gains a Pins block showing fill + ring at each zoom rung, with token names.
- [x] `docs/DESIGN_SYSTEM.md` gains a Map pins section with the ring rule and table.

## Browser matrix
| | Desktop |
|---|---|
| Light | Map ✓ · Chapter ✓ · `/repairs` ✓ |
| Dark | Chapter ✓ (map basemap is theme-independent) |
| System | not separately exercised — no theme-dependent tokens touched |
Phone width not exercised — layout unchanged; the Pins grid is `grid-cols-2 md:grid-cols-4`.

## Findings
- **[Minor] Snow ring is invisible on a snow canvas** — `/repairs` in light mode shows a borderless rust dot. Mirrors the map (basemap is off-white, ring reads as a thin halo) and the design-system tile is on a snow strip for the same reason. Accepted; noted in the chapter copy.
- **[Nit] `--radius` values are integers by design** — fractional radii at DPR 1 would reintroduce softness. Comment in `map.tsx` says so.

## Noticed (outside this change)
- `app/ui/sidebar.css` still carries `#818181` / `#f1f1f1` (LEGACY in the token gate) — XS burn-down brief.
- Preflight is red on the Next 14.2.14 advisories (`docs/briefs/next-upgrade-15.md` exists) — release decision sits with Security/Ops.

---
Next: `/security-ops` on `map-pin-rings` — deploy pending the Next-advisory decision.
