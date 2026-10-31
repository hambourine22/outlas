# Rental locations near the world resorts

**Slug:** `rentals-near-resorts` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** M

## Problem
The resort layer now covers 100 resorts across seven regions, but the rental layer only has 4 pins — all in Scotland. A rider who clicks a resort in Chamonix, Niseko or Whistler can see the resort card but has no answer to the obvious next question: *who do I rent from?* The glacier-blue rental pin exists on the pin key with "4 · GLACIER" and that count reads as a bug when the map covers the globe.

## Why now
The world-resort layer just shipped (slug: `world-mountain-resorts`, release 2026-10-31). Pairing rentals to resorts in the same visual language is the obvious next data layer. Also: the (empty) Airtable JSON export the user pointed me at means we don't yet have real seeded rental data — the hand-curated expansion is the right v1 before any API integration.

## Success signal
A rider who clicks a resort pin anywhere in the top-30 world resorts can see at least one glacier-blue rental pin within a few kilometres of the resort base, click it, and see a named shop with a gear line and a legible address.

## In scope
- Extend [`app/content/map/rentals.ts`](../../app/content/map/rentals.ts) with ~30 named rental shops near the top-30 world resorts across Scotland / Alps / North America / Japan / Scandinavia / Southern Hemisphere.
- Use real shop names where honestly known; omit phone / email / website fields rather than fabricate contact data (the preview panel's shape-aware code already omits empty details rows).
- Keep schema unchanged — the existing `Rentals` type and `rental()` factory already carry everything we need (`name`, `slug`, `item_id`, `resorts`, `gear_for_rent`, `resort_description`, `resort_Address`, `lat`, `long`, `regions`).
- Pin count in the sidebar updates live from 4 to ~34.

## Out of scope
- Live inventory, availability, or booking (would need an API + contracts with each shop).
- Phone / email / website fields for shops where contact details aren't honestly known — leave blank. This is a UI contract we already honour.
- Any rental for resorts outside the top-30 — the long tail waits for Airtable/API seeding.
- Pricing, gear-level comparisons, delivery scheduling — out of this slug entirely.
- Any new type extensions, new preview-panel primitives, or new specimen chapters — pure data expansion.

## Seats
- [ ] `/ux` — **skipped** (data expansion inside an existing content type; no new behaviour, no new states, no new copy — the preview panel already handles rentals since the previous slug). Record intent in commit message.
- [ ] `/ui` — runs. Just the data file.
- [ ] `/review-qa` — runs. Gate script + quick browser spot-check (glacier pin visible near a representative resort; sidebar count updates).
- [ ] `/security-ops` — runs. No new env, no new secrets, static data only — straight to preflight + deploy.

## Links
- Pin-key hand-off: [`docs/MAP_MENU_ARCHITECTURE.md`](../MAP_MENU_ARCHITECTURE.md) (glacier = rentals; `--brand-glacier` triplet already bound).
- Preview panel contract: [`docs/specs/world-mountain-resorts.md`](../specs/world-mountain-resorts.md) (shape-aware `summariseRental` already in [`app/ui/mapbox/MapPreviewSidebar.tsx`](../../app/ui/mapbox/MapPreviewSidebar.tsx)).
