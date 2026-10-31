# Top-5 statistics per resort — spec

**Slug:** `resort-stats-pack` · **Brief:** `docs/briefs/resort-stats-pack.md` · **UX:** Hamish · **Date:** 2026-10-31 · **Status:** ready-for-ui

## 1. Problem & success signal
A rider decides between resorts on numbers — altitude, vertical, terrain, lifts, snowfall. The preview panel currently has none of them. When this ships, every resort with a curated stat pack shows a 5-column strip above the season bar; a resort with partial data shows only the cells it carries honestly.

## 2. Users & context
- **Who:** rider, on a phone, comparing options.
- **UX moment:** `data-surface="story"` (preview panel), carries into the StatStrip which stays theme-neutral (brand ink on canvas).
- **Entry:** pin click on map.

## 3. Flow
Pin click → preview opens → status badge + place line → **StatStrip (new)** → hairline → season bar → activities → body → details.

### Branches & states
- **Default (all 5 stats):** 5 columns, hairline divider between.
- **Partial (3 of 5):** 3 columns, dividers only between present ones.
- **Zero stats:** whole strip omits; no empty placeholder.
- **Narrow (375px):** 5 columns still fit — unit is already compressed, numbers right-aligned, label caps below.
- **Loading / error:** inherited from the panel; no stat-level skeleton in v1.

## 4. Content
| Where | Copy | Notes |
|---|---|---|
| Stat value | plain number with unit — `1,245 m`, `823 m`, `30 km`, `11`, `1.5 m` | `font-mono text-[13px] text-ink` |
| Stat label | `PEAK` / `VERTICAL` / `TERRAIN` / `LIFTS` / `SNOWFALL` | `.label text-ink-faint`, 1 word each |
| Section header | *(none)* — strip is self-explanatory | — |

### The 5 stats, canonicalised
1. **PEAK** — peak altitude in metres (e.g. `1,245 m`).
2. **VERTICAL** — vertical drop in metres from base to peak (e.g. `823 m`).
3. **TERRAIN** — total pisted terrain in kilometres (e.g. `30 km`). For resorts that publish area rather than piste-km, convert `ha × 0.1` as a working rule and mark `~` in the record comment.
4. **LIFTS** — total number of lifts (chairs + gondolas + drag; no magic carpets).
5. **SNOWFALL** — annual average snowfall. Written in metres when ≥ 1 m (e.g. `15 m`); in cm below (e.g. `80 cm`).

Missing stats omit silently — never render a `—` or `n/a`.

## 5. Structure
- **Reuses:** `.label`, `font-mono` numerics, `border-rule` hairlines, panel padding ladder.
- **New:** `StatStrip` component — a `<ul>` with `role="list"`, each `<li>` is `.label` caps + `font-mono` number + optional unit span.
- **Specimen:** update chapter 15 Resort Card with a new section `Stat strip · default · partial · empty`.
- **Content source:** fields on `Resorts` from `app/content/map/resorts.ts`. No new facade needed.

## 6. Accessibility
- Each stat is announced as `<label> <value> <unit>` — "Peak 1,245 metres".
- Numbers are `font-mono`, no decorative kerning that confuses screen readers.
- Hairline dividers are decorative (`aria-hidden`).
- Contrast: labels use `--ink-faint` (decorative, large), values use `--ink` (body contrast target ≥ 4.5:1).

## 7. Acceptance criteria
- [ ] **AC1 — all five** — Given a resort with all five stats, when the panel opens, then a 5-column strip renders above the season bar with values `PEAK · VERTICAL · TERRAIN · LIFTS · SNOWFALL` in that order.
- [ ] **AC2 — partial** — Given a resort with only `peak_m` and `lifts`, when the panel opens, then only two columns render (PEAK and LIFTS) with a hairline between them.
- [ ] **AC3 — zero** — Given a resort with none of the five, when the panel opens, then the entire StatStrip and its container omit.
- [ ] **AC4 — unit formatting** — Snowfall `150` renders as `1.5 m`, `80` renders as `80 cm`, `1500` renders as `15 m`. Terrain `30` renders as `30 km`. Peak and vertical always `N,NNN m` (thousands separator, metric unit).
- [ ] **AC5 — Scotland live** — Given the live site, when the user opens any of the five Scottish resorts (Cairngorm, Glencoe, Nevis Range, Glenshee, The Lecht), then the StatStrip shows accurate numbers sourced from each resort's own site or Wikipedia (verified in review).
- [ ] **AC6 — dark mode** — Values remain `--ink`, labels `--ink-faint`, hairlines `--rule` in both themes.
- [ ] **AC7 — mobile (375px)** — 5 columns fit without horizontal scroll; labels wrap only if the longest (`SNOWFALL`) truly won't fit, in which case the strip reflows to 2 rows.
- [ ] **AC8 — specimen** — `/design-system#resort-card` shows three StatStrip variants (all five, three of five, zero → omitted) under the new section heading.

## 8. Assumptions
| # | Assumption | Confidence | If wrong |
|---|---|---|---|
| A1 | 5 columns fit at 375px when each number is ≤ 5 characters | Medium-High | Reflow to a 2-row grid (3+2) — one-line change |
| A2 | Snowfall as m/cm is more legible than inches for a global audience | High | Add a user-pref metric/imperial toggle later |
| A3 | Terrain in piste-km is better than area-ha for comparison | Medium | Second row underneath showing `(N ha)` as supplementary |
| A4 | Omitting missing stats silently is less noisy than placeholders | High | Add `—` for cells where the whole dataset has partial coverage |

**Open questions:**
1. Should the stat strip link anywhere (deep-link to a comparison page later)? *Assumption: no in v1; display-only.*

## 9. Appendix
Sources for Scotland numbers (verified in review):
- Cairngorm Mountain: cairngormmountain.co.uk, Wikipedia
- Glencoe Mountain Resort: glencoemountain.co.uk
- Nevis Range: nevisrange.co.uk
- Glenshee: ski-glenshee.co.uk
- The Lecht: lecht.co.uk

---
Next: `/ui` on `resort-stats-pack`. UI decides: StatStrip exact spacing, number-font rung, mobile reflow threshold, specimen layout, and the five Scotland records' numbers.
