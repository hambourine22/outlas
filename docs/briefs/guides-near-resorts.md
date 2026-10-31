# Guides near the world resorts

**Slug:** `guides-near-resorts` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** M

## Problem
Resorts (100), rentals (33) and repairs (24) are all live across the globe, but the guides layer still shows "4 · SAND" — all four in Scotland. A rider who wants expertise for a ski-touring week in Chamonix, Haines Pass or Niseko sees no sand pins anywhere outside Scotland. The provider taxonomy reads incomplete.

## Why now
Natural follow-on to `rentals-near-resorts` and `repairs-near-resorts` — same editorial pattern, same data pattern. Completes the four-provider taxonomy that the sidebar key names.

## Success signal
A rider who clicks a resort pin in the top-15 world ski-touring destinations can see at least one sand-coloured guide pin nearby, click it, and see a named guide service with disciplines, languages and the region they work.

## In scope
- Extend [`app/content/map/guides.ts`](../../app/content/map/guides.ts) with ~18 named guide bureaus / alpine schools near the top-15 world resorts.
- Prefer **real-named bureaus** (Compagnie des Guides de Chamonix, Zermatt Alpin Center, Jackson Hole Mountain Guides, Exum Mountain Guides, Aspen Alpine Guides, Alpine Guides New Zealand…) over inventing individual guide names — the honest data layer is the office, individuals come later from Airtable.
- Fill `disciplines`, `languages`, `regions` and a short `bio`. Leave `phone` / `website` / `rate_per_day` blank where not honestly known — preview panel omits empty rows.
- Sidebar count updates from 4 to ~22.

## Out of scope
- Live booking, availability, rate matching.
- Individual guide profiles — v2 brief once Airtable is wired.
- Guides outside the top-15 (long tail waits for data).
- Any new type extensions, new preview-panel primitives, or new specimen chapter.

## Seats
- [ ] `/ux` — skipped (same pattern as rentals/repairs slugs; data expansion inside existing content type).
- [ ] `/ui` — runs. Data file only.
- [ ] `/review-qa` — runs. Gate script + spot-check on live.
- [ ] `/security-ops` — runs. No new env, no secrets.

## Links
- Previous slugs: [`rentals-near-resorts`](rentals-near-resorts.md), [`repairs-near-resorts`](repairs-near-resorts.md).
- Pin-key hand-off: [`docs/MAP_MENU_ARCHITECTURE.md`](../MAP_MENU_ARCHITECTURE.md) — sand = guides, human expertise.
