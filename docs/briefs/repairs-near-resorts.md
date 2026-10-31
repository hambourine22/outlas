# Repair locations near the world resorts

**Slug:** `repairs-near-resorts` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** M

## Problem
The map now carries 100 resorts and 33 rentals across the globe, but the repair layer still shows "3 · RUST" — all three in Scotland. A rider in the Alps or North America who clicks a resort card and sees "Learn more" but can't see where to get edges tuned, bindings serviced or a damaged base ground is reading an incomplete picture of what Oütlas is for.

## Why now
Natural follow-on to `rentals-near-resorts` — same editorial logic, same data pattern. Pairing the rust-coloured repair pins to the resort/rental cluster makes the pin key read as a complete taxonomy rather than a Scotland-only service list.

## Success signal
A rider who clicks a resort pin anywhere in the top-20 world resorts can see at least one rust-coloured repair pin within a few kilometres, click it, and see a named shop with an address and (where honestly known) hours.

## In scope
- Extend [`app/content/map/repairs.ts`](../../app/content/map/repairs.ts) with ~20 named tune/service shops near the top-20 world resorts.
- Use real shop names where honestly known. Where a resort's known tuning shop is the same brand as its rental (common — Christy Sports, Jans, Rhythm, SkiStar), use the service-dept address or a nearby location, not a duplicate pin.
- Leave phone / website blank where not honestly known — preview panel's shape-aware code already omits empty detail rows.
- Pin count in the sidebar updates live from 3 to ~23.

## Out of scope
- Live booking, availability, turnaround times — needs an API + contracts.
- Pricing for tune/wax/base repair services.
- Any new type extensions, new preview-panel primitives, or new specimen chapter — pure data expansion.
- Repair shops outside the top-20 world resorts — long tail waits for Airtable/API seeding.

## Seats
- [ ] `/ux` — skipped (same pattern as `rentals-near-resorts`; data expansion inside existing content type; preview panel already handles repairs).
- [ ] `/ui` — runs. Data file only.
- [ ] `/review-qa` — runs. Gate script + spot-check on live.
- [ ] `/security-ops` — runs. No new env, no new secrets.

## Links
- Previous slug (same pattern): [`docs/briefs/rentals-near-resorts.md`](rentals-near-resorts.md), [`docs/releases/2026-10-31-rentals-near-resorts.md`](../releases/2026-10-31-rentals-near-resorts.md)
- Pin-key hand-off: [`docs/MAP_MENU_ARCHITECTURE.md`](../MAP_MENU_ARCHITECTURE.md) — rust = repairs
- Note: a sibling session (`outlas-content-fork`) is actively refactoring pin tokens / preview panel / map visuals. This slug touches only `app/content/map/repairs.ts` and the release docs, so it should merge cleanly with their work regardless of order.
