# Top-5 statistics per resort, rolled out region by region

**Slug:** `resort-stats-pack` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** M (new primitive + type extension + curated data per region)

## Problem
The pin preview now carries status, season and activities, but a rider deciding between two resorts has no quantitative anchor — they can't see at a glance that Zermatt's vertical is 2,281m, Chamonix's 2,807m, or that Niseko gets ~15m of snow a year. Numbers are the universal language of mountains; without them the preview feels editorial, not informational.

## Why now
The three new primitives from `world-mountain-resorts` shipped the data-shaped UI (status badge, season bar, activity chips). The right next layer is the numeric one. Doing it region by region lets us curate honestly rather than slopping in approximations across 100 resorts in one go.

## Success signal
A rider on the live site can open any Scottish resort's preview and see five numbers that let them compare it to Chamonix or Niseko — peak altitude, vertical drop, pisted terrain, lift count, average annual snowfall — rendered as one compact 5-column stat strip above the season bar.

## In scope
- Extend `Resorts` type with: `peak_m?: number`, `vertical_m?: number`, `terrain_km?: number`, `lifts?: number`, `snowfall_cm?: number` (all optional — a stat the dataset doesn't carry simply omits its cell).
- New primitive **StatStrip** inside `MapPreviewSidebar.tsx` — 5 equal columns, number (font-display or font-mono big) + label caps + unit, hairline divider between cells. Any missing stat → cell omitted (strip shrinks).
- Specimen chapter update under `/design-system#resort-card` — add StatStrip row at full width (5 stats), narrow (3 stats, 2 omitted), empty (zero → whole strip omitted).
- **Region 1: Scotland (5 resorts)** curated with honest numbers from Wikipedia / each resort's own site. This brief ships Scotland only; subsequent regions open their own iteration-sized briefs (`resort-stats-alps`, `resort-stats-na`, `resort-stats-japan` etc.) once the pattern is approved.

## Out of scope
- The remaining 95 resorts — those come in follow-up briefs by region, confirmed with Hamish after Scotland lands.
- Snow report, live conditions, lift status API (same deferral as the status badge).
- Comparison UI (two resorts side by side) — v2.

## Seats
- [ ] `/ux` — short spec: which 5 stats, which units, visual shape, acceptance criteria. One pass.
- [ ] `/ui` — StatStrip primitive + type extension + Scotland data + specimen update.
- [ ] `/review-qa` — gate + browser matrix + verify Scotland numbers against sources.
- [ ] `/security-ops` — ship (no env delta, no new secrets).

## Links
- Previous slug: `docs/briefs/world-mountain-resorts.md`, `docs/specs/world-mountain-resorts.md`
- Live map: https://outlas-ds.vercel.app/
- Pattern reference: Komoot route card's stat strip (distance / elevation / difficulty / duration).
