# World mountain resorts on the map, with status

**Slug:** `world-mountain-resorts` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** L

## Problem
The map currently shows five Scottish resorts and nothing else. A rider planning a trip to Chamonix, Niseko or Portillo can't see them at all, and even for the Scottish pins the preview panel reveals nothing about whether the resort is open today, when its season runs or what activities it supports. The map reads as a Scotland-only tool for a brand that's about mountains anywhere.

## Why now
Core map architecture (sidebar + preview + filters) just shipped; the content layer is designed to grow (`getMapData()` → `fetchResorts()` with typed-array fallback). The right moment to seed the world dataset and the preview-panel treatments for operational signal is *before* real users form the mental model "Oütlas = Scotland only."

## Success signal
A rider on the live site can see mountain resorts across the Alps, North America, Japan, Scandinavia and the Southern Hemisphere, and clicking any pin shows at a glance: is it open today, when is its season, and what can I do there — with no hover, no scroll, no second click.

## In scope
- Extend `Resorts` type with:
  - `operational_status: "open" | "seasonal" | "closed"` (operational, not weather)
  - `season_from` / `season_to` (ISO month-day strings, e.g. `"12-15"` → `"04-20"`)
  - `activities: Activity[]` (curated enum, 3–6 per resort)
- Curate ~80–120 resorts across regions (named below in UX spec)
- Each resort gets: `name, slug, lat, long, region (country/state), altitude, operational_status, season_from, season_to, activities, image_url (optional)`
- Right-rail preview panel renders new primitives:
  - **Status badge** (top-right of hero, or beside title) — "Open today" / "In season" / "Out of season" / "Closed permanently"
  - **Season bar** — a 12-month horizontal rule with the open window filled in brand ink
  - **Activity chips** — pills with activity label, max 6 shown, overflow collapses to "+ 3 more"
- Map adapts: initial centre/zoom shows the whole landmass, not just Scotland (zoom-to-fit on load)
- Status is computed client-side from today's date vs. season window — no live API

## Out of scope
- Live weather, live snow depth, live lift status (needs API + budget)
- Resort imagery (hero images for every resort — placeholder treatment is fine)
- Resort detail routes (`/resorts/<slug>`) — right-rail is enough for v1
- Bookings, pricing, contact details beyond what the existing `Resorts` type carries
- Trail maps, piste counts, lift counts — "major activities" only, not exhaustive
- User-submitted edits — read-only dataset for v1

## Seats
- [ ] `/ux` — runs. Status taxonomy, activity set, season-bar design, world-view map config, acceptance criteria.
- [ ] `/ui` — runs. New primitives + extended Resorts type + ~100 curated records.
- [ ] `/review-qa` — runs. Gate script + visual verification in both themes, both viewports.
- [ ] `/security-ops` — runs. Consulted at the start for data boundary (static records vs. API), owns the deploy.

## Links
- Existing: [app/content/map/resorts.ts](../../app/content/map/resorts.ts), [app/definitions/mapboxDefinitions.ts](../../app/definitions/mapboxDefinitions.ts), [app/ui/mapbox/MapPreviewSidebar.tsx](../../app/ui/mapbox/MapPreviewSidebar.tsx), [app/ui/mapbox/map.tsx](../../app/ui/mapbox/map.tsx)
- Architecture: [docs/MAP_MENU_ARCHITECTURE.md](../MAP_MENU_ARCHITECTURE.md), [docs/DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- Pattern reference: Komoot resort cards (season bar), OnX Hunt (activity chips)
