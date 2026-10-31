# World mountain resorts on the map, with status — spec

**Slug:** `world-mountain-resorts` · **Brief:** `docs/briefs/world-mountain-resorts.md` · **UX:** Hamish · **Date:** 2026-10-31 · **Status:** ready-for-ui

## 1. Problem & success signal

The map today reads as a Scotland-only tool. A rider planning a trip to Chamonix, Niseko or Portillo can't see those places exist here, and clicking any existing pin reveals no answer to the two questions a rider actually brings to a resort card: *is it open?* and *what can I do there?* When this ships, a visitor can pan the globe, see curated mountain resorts in every major ski region, and click any pin to learn — without scrolling, without a hover — whether it's open today, when its season runs, and the half-dozen activities it supports.

## 2. Users & context

- **Who:** rider — the Scotland-based or Scotland-curious outdoor-sports enthusiast who's also considering a trip abroad, plus the editorial reader who wants to understand what Oütlas thinks a "mountain" means.
- **Device & moment:** phone first (on a train planning a weekend; at a work desk between tabs), desktop second. One-handed, often with limited attention.
- **UX moment:** `data-surface="story"` for the preview panel's hero band — resorts live in the story surface, same editorial register as Ski Touring & Risk Space. The sidebar and the map itself remain neutral (no surface).
- **Entry points:** direct URL (`/`), the TopBar `OÜTLAS` wordmark, future search, deep links from stories ("read about Chamonix on the map").

## 3. Flow

### Primary path
1. Rider lands at `/`. Map renders the whole landmass (world view, zoom ≈ 1.5). The pin layer paints ~100 resort dots across the globe.
2. Rider pans/zooms to a region they care about (the Alps, Hokkaido, the Southern Alps of NZ). The left `MAP SYMBOLS` sidebar is unchanged.
3. Rider taps a pin. Right rail opens with the resort's preview: hero band, title, place line, **status badge** inline with the place line, **season bar** (12 months, open window filled), **activity chips** (max 6), existing Details list below.
4. Rider reads the status at a glance ("In season") and the season window ("Dec → Apr"). They see "Ski · Snowboard · Hike · Bike · Climb · + 1 more" — enough to decide whether to dig deeper.
5. Rider taps "Learn more" or closes the panel and taps another pin.

### Branches & states
- **Empty (no resorts at this zoom):** the pin layer is still there; nothing to render if the viewport contains no pins. No empty-state copy on the map.
- **Status computation fails** (date math returns `null`): status badge omits itself; the panel reads clean. Never fabricate a status.
- **No activities on record:** the chips row omits itself. No "Activities: —" placeholder.
- **No season window:** the season bar omits itself. The badge falls back to "Open" (year-round) or "Closed".
- **No cover image:** the hero band keeps the current tinted-surface + brand-dot fallback already shipped.
- **No Mapbox token (preview deploy):** existing `MapPlaceholder` kicks in — the resort count on the placeholder updates to the world total, not just Scotland.
- **Returning user:** theme respected (`outlas:theme`). Camera does NOT persist — every visit starts at world view, so the brand's reach reads first every time.
- **Narrow (≤ 640):** right rail becomes full-width (as today), season bar stays 12 cells, activity chips wrap to a second row.

## 4. Content

### Status taxonomy — brand voice

| State | Chip copy | When | Visual |
|---|---|---|---|
| **Open** | `OPEN` | `operational_status === "year-round"` | Pine dot `●`, label caps, `--ink` text |
| **In season** | `IN SEASON` | `operational_status === "seasonal"` AND today ∈ [season_from, season_to] | Glacier dot `●`, label caps, `--ink` text |
| **Out of season** | `OUT OF SEASON` | `operational_status === "seasonal"` AND today ∉ window | Hollow dot `○`, label caps, `--ink-muted` text |
| **Closed** | `CLOSED` | `operational_status === "closed"` | Rust dot `●`, label caps, `--ink-muted` text, title gets `line-through decoration-ink/40` |
| **Unknown** | *(omit)* | computation returns null | Nothing renders; no apology copy |

Voice: label-caps, two words max, no exclamation marks, no "Oops". "OUT OF SEASON" sits as calm fact, not as a warning. "CLOSED" is final — no "unfortunately" — because the brand respects the reader's time.

### Season bar — microcopy
- Month letters below: `J F M A M J J A S O N D` (`font-mono text-[10px] uppercase tracking-wide text-ink-faint`).
- Current month marker: a 2px tick above the bar at the month's cell center. No label.
- Legend copy — a single hairline-rule line below the bar: `Season — <Mon-DD> to <Mon-DD>` (e.g. `Season — Dec 15 to Apr 20`). Omitted if year-round or closed.

### Activity enum (10)
```
ski · snowboard · splitboard · hike · trail-run · bike · climb · kayak · wild-swim · sail
```
Max 6 chips per resort. Overflow collapses to `+ N more` as the 7th chip. Each chip is `font-mono text-[10px] uppercase tracking-wide` inside a hairline-border pill, label-caps labels only.

Rendered row header above the chips: `label text-ink-faint` reading `Activities`.

### Everything else that renders in the panel
Already shipped (Title, place, Learn more, Details). This spec only adds: status badge, season bar, activities row — inserted between the place line and the body text, in that order.

| Where | Copy | Notes |
|---|---|---|
| Status badge | `OPEN` / `IN SEASON` / `OUT OF SEASON` / `CLOSED` | `.label` typographic treatment, inline with place line, right-aligned on wide, below on ≤ 640 |
| Season bar label | `Season — Dec 15 to Apr 20` | `font-ui text-xs text-ink-muted`, under the bar |
| Activities header | `Activities` | `.label text-ink-faint`, above the chip row |
| No-chip edge | *(row omitted)* | Never render "No activities listed" |

## 5. Structure

- **Reuses:** existing `MapPreviewSidebar` scaffold (hero band, title, place, Details, Close), hairline-rule pattern from Story pages, `.label` + `font-mono` tokens, brand palette tokens (pine/glacier/rust/sand) for status dot colours.
- **New primitives (all additive, inside `MapPreviewSidebar`):**
  - `StatusBadge` — dot + label, four states, derived from props at render.
  - `SeasonBar` — 12-cell SVG strip + month letters + today marker + legend line. One component; year-round/closed callers simply don't render it.
  - `ActivityChips` — chip row with overflow collapse at > 6.
- **Specimen chapter needed in `/design-system`:** yes, under `Patterns · Map` — new section `Resort card` that shows status badge in all four states, season bar across winter/summer/year-round, and activity chip overflow at 7.
- **Content source:** `app/content/map/resorts.ts` — static typed records. **No external API call.** The `Resorts` type extends with:
  ```ts
  operational_status: "year-round" | "seasonal" | "closed";
  season_from?: `${MM}-${DD}`;   // "12-15"
  season_to?:   `${MM}-${DD}`;   // "04-20"
  activities: Activity[];
  country: string;               // e.g. "France", "USA/Vermont", "Japan"
  ```
  `region: "Scotland"` default stays — new records set their own country/region. The old `region` field is widened semantically to any geographic string.
- **World map config:**
  - `INITIAL_CENTER = [10, 35]`, `INITIAL_ZOOM = 1.5` — Europe-biased world view that still shows the Americas and Pacific.
  - On first load (not on reset), fit camera to the bounding box of all visible pins, padded 10%. If the fit math puts zoom < 1.3, clamp to 1.3 (so Antarctica doesn't rule the frame).
  - Reset-view button: returns to the initial world view, not Scotland.
  - No clustering in v1. At 100 pins max across the globe, pins read fine from zoom 1.3 upward. If a region clusters visually (Alps: ~35 pins packed), the user zooms — Mapbox handles the depth.

## 6. Accessibility requirements

- **Keyboard path:** Tab reaches the Reset view button → the left `MAP SYMBOLS` toggle → the group headers → the filter rows → footer buttons. When a pin is selected (via `Enter` on a map pin — Mapbox GL doesn't natively keyboard-select pins, so this is deferred to v1.1), focus moves to the right rail's Close button. Escape closes the right rail and returns focus to the map canvas.
- **Names:** status badge announces as `Status: open` / `Status: in season` / `Status: out of season` / `Status: closed`. Season bar announces as `Season from December 15 to April 20`. Each activity chip announces as its label (`Ski`, `Snowboard`, …). The overflow chip announces as `and <N> more activities`.
- **Text classes:** status badge is **large text** (`.label` is uppercase letter-spaced, functions as large) → 3:1 contrast target. Season bar's month letters are **small text** → 4.5:1 required against the panel surface. Chip labels are small → 4.5:1 required.
- **Motion:** status badge dot fades in (120ms) when panel opens; season bar's today-marker is static (no pulse); chip row has no entrance animation beyond the panel slide. Under `prefers-reduced-motion: reduce`, all three render instantly, no fade. Panel slide-in is already reduced-motion aware upstream.
- **Targets:** chips are display-only (no hover handler yet); 24px height is fine. Status badge is display-only. Season bar cells are not interactive in v1 (future: hover a month, see "typical conditions"). No sub-44px interactive targets introduced.

## 7. Acceptance criteria

Each one is checkable in a browser or by a script. QA ticks these verbatim.

- [ ] **AC1 — world coverage** — Given the live site at `/`, when the map tiles finish loading, then pins render in Scotland, the Alps, North America, Japan, Scandinavia and the Southern Hemisphere (at minimum one visible pin per region at the initial zoom).
- [ ] **AC2 — initial camera** — Given a cold load, when the map first paints, then the camera shows at least Europe, North America and Japan simultaneously, with no horizontal page scroll at a 1440px viewport.
- [ ] **AC3 — status badge: in season** — Given a resort with `operational_status: "seasonal"`, `season_from: "12-15"`, `season_to: "04-20"`, when today is `2026-01-20` (any date within the window), then the preview panel renders a badge reading `IN SEASON` beside the place line.
- [ ] **AC4 — status badge: out of season** — Given the same resort on `2026-07-01`, when the panel opens, then the badge reads `OUT OF SEASON` and the badge dot is hollow (`○`).
- [ ] **AC5 — status badge: closed** — Given `operational_status: "closed"`, when the panel opens, then the badge reads `CLOSED` and the title has strike-through decoration.
- [ ] **AC6 — status badge: year-round** — Given `operational_status: "year-round"`, when the panel opens, then the badge reads `OPEN` and no season bar renders.
- [ ] **AC7 — season bar fill** — Given a resort with `season_from: "12-15"` and `season_to: "04-20"`, when the season bar renders, then the Dec, Jan, Feb, Mar and Apr cells are filled with `--ink` and the other seven cells are `--ink-faint`.
- [ ] **AC8 — season bar today marker** — Given today is any date in April, when the season bar renders, then a 2px tick appears above the April cell and no other cell.
- [ ] **AC9 — season bar legend** — Given a resort with any season window, when the bar renders, then a single line below it reads `Season — <Mon DD> to <Mon DD>` using the resort's own dates.
- [ ] **AC10 — activities row** — Given a resort with `activities: ["ski", "snowboard", "hike", "bike"]`, when the panel opens, then four hairline-border pills render in that order, each uppercase, each in `font-mono`.
- [ ] **AC11 — activities overflow** — Given a resort with 8 activities, when the panel opens, then the first 6 chips render followed by a seventh reading `+ 2 MORE`.
- [ ] **AC12 — activities omit** — Given a resort with `activities: []`, when the panel opens, then neither the `Activities` header nor the chip row renders — no placeholder.
- [ ] **AC13 — dark mode** — Given the theme is dark (or system on a dark OS), when any resort panel opens, then every colour resolves to brand tokens (no hard-coded hex) and the status badge dot colours remain pine/glacier/rust/sand.
- [ ] **AC14 — mobile (375px)** — Given a 375px viewport, when the panel opens, then no horizontal page scroll, the hero band is 16:9, the status badge wraps to its own line below the place line, the season bar spans the panel width minus 24px padding, and activity chips wrap onto a second row.
- [ ] **AC15 — keyboard** — Given keyboard only, when the panel is open, then Tab reaches Close → Learn more → each activity chip (via `tabindex="0"` if interactive in future; display-only in v1 means they are skipped and announced only to screen readers via the `dl`-equivalent list).
- [ ] **AC16 — reduced motion** — Given `prefers-reduced-motion: reduce`, when the panel opens, then the status dot and chip row appear instantly, no fade.
- [ ] **AC17 — data integrity** — Given the deployed app, when the content layer loads, then every resort record passes a type-check (`operational_status` present, `activities` is a valid subset of the enum, if `operational_status === "seasonal"` then both `season_from` and `season_to` are present).
- [ ] **AC18 — no new environment variables** — Given a fresh clone, when `pnpm build` runs with only `NEXT_PUBLIC_MAPBOX_TOKEN` set, then the build succeeds and the resort dataset is complete — no secrets, no API keys, no runtime fetch.
- [ ] **AC19 — specimen** — Given the `/design-system` route, when the user scrolls to `Patterns · Map · Resort card`, then all four status states, three season-bar variants (winter window, summer window, year-round=omitted) and the 7-chip overflow render.
- [ ] **AC20 — view summary** — Given the sidebar footer, when the resort dataset is 100 pins, then the "n of N pins visible" footer reads `100 of 100 pins visible` with all providers on, and updates live as filters toggle (unchanged behaviour but with the new count).

## 8. Assumptions & open questions

| # | Assumption | Confidence | If wrong |
|---|---|---|---|
| A1 | A static dataset of ~100 curated resorts is enough signal for v1; a live API is not required | High | Switch to a server-side fetch in `getMapData()`; brief + ops gate for the new secret |
| A2 | Rider wants season window as a shape (12-cell bar) more than as prose | High | Collapse the bar into one copy line and reclaim the vertical space |
| A3 | Max 6 activity chips keeps the panel compact without feeling thin | Medium | Lift the cap to 8 and reduce chip padding; architecture doesn't change |
| A4 | "Out of season" reads as calm fact, not as a warning, in brand voice | Medium | Reword to `BETWEEN SEASONS` and lift the tone |
| A5 | World-view default (zoom 1.5) is more useful than Scotland-centric for first-time visitors | Medium-High | Add a user preference "home view" in localStorage; default stays world |
| A6 | Status is derivable from `today vs. season` alone — no real-time ski-report integration | High | Mark status as "data: operational only; conditions coming soon" in the UI |
| A7 | 100 pins across the globe doesn't need clustering at zoom 1.3+ | Medium | Add Mapbox cluster layer for `locations` source; one-file change in `map.tsx` |
| A8 | Legacy Scotland-centric fields (altitude as string, total_score numeric) are kept intact for backwards compat with existing records | High | A migration pass; out of scope here |

**Counter-evidence:** Komoot and FATMAP show live snow depth and wind — our status-only treatment may read as thin to the first serious user. The spec still holds because *operational status is the honest baseline*; adding conditions is a layer on top, not a replacement. The current treatment ships truth; adding dynamic conditions is a v2 brief owned by `/security-ops` (new API, new secret, new SLA).

**Open questions (≤ 3):**
1. Does "closed permanently" (e.g. Donner Ski Ranch — hypothetical) warrant its own badge, or does `CLOSED` suffice? — Hamish, before `/ui` ships copy. *My assumption: `CLOSED` suffices in v1; v2 can split `CLOSED_PERMANENTLY` from `CLOSED_INDEFINITELY` if the data demands it.*
2. For resorts in the Southern Hemisphere, do we flip the season window logic or trust the raw dates? *My assumption: trust raw dates — Portillo's `06-15 → 10-15` renders correctly on a 12-cell Jan→Dec bar without special-casing.*
3. Should Scotland-ONLY retain its own default camera for returning users who set it that way? *My assumption: no persistence in v1; world view is the brand's claim.*

## 9. Appendix

- **Options considered:**
  - *Option A — single "Open / Closed" boolean:* simpler but loses the season window, which is the brand's actual signal.
  - *Option B — live snow report API:* richer but adds a secret, cost and SLA. Deferred to v2.
  - *Option C — status derived from upstream resort website scraping:* unreliable, requires fallback copy, deferred.
  - *Chosen — static operational + season window, status derived at render:* honest, maintainable, no new secrets, owns the field.
- **References:**
  - Season-bar pattern: Komoot's "best time to visit" strip on route cards.
  - Activity chips: OnX Hunt map labels; adapted to hairline pills.
  - Status taxonomy voice: Oütlas's own hairline economy — see `label` utility in [docs/DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md).
  - Menu hand-off: [docs/MAP_MENU_ARCHITECTURE.md](../MAP_MENU_ARCHITECTURE.md) — this spec composes under the live Providers group's `Resorts` row; no sidebar change is required.
- **Research notes:**
  - Current `MapPreviewSidebar.tsx` has a `summariseResort(r, hero)` helper. New fields slot into the same summary → render shape; no architectural change.
  - The current `Resorts` type carries ~30 legacy fields (score dimensions, cost breakdowns). None are rendered today beyond altitude / rail / charge-point / Oütlas score. Extend, don't replace.

---
Next: `/ui` on `world-mountain-resorts`. UI decides: exact chip spacing, season-bar cell width in rem, pill border radius (max 6px per system), specimen chapter layout, and the ~100 curated records (name/lat/long/altitude/country/operational_status/season window/activities).

---

## UI note (2026-10-31)

### Structure chosen
- Three new primitives — `StatusBadge`, `SeasonBar`, `ActivityChips` — live inside [`app/ui/mapbox/MapPreviewSidebar.tsx`](../../app/ui/mapbox/MapPreviewSidebar.tsx) and are re-exported for the specimen chapter.
- `deriveStatus(resort, now?)` is the one helper that collapses `(operational_status + season_from + season_to + today)` into a `ResortStatus`. Panel never guesses — when the record can't compute, the badge omits itself.
- Panel insertion order (per spec): hero → title → place line **with StatusBadge right-aligned** → hairline → **SeasonBar** (resort only, omitted when year-round/closed) → **ActivityChips** (resort only, omitted when empty) → body → Learn more → Details.

### Data layer
- `Resorts` type gained `operational_status`, `season_from?`, `season_to?`, `activities[]`, `country?` — see [`app/definitions/mapboxDefinitions.ts`](../../app/definitions/mapboxDefinitions.ts).
- Activity enum lives in [`app/content/map/types.ts`](../../app/content/map/types.ts) as `ACTIVITIES` tuple + `Activity` type + `ACTIVITY_LABEL` map, imported by both the record set and the chip component.
- 100 curated records in [`app/content/map/resorts.ts`](../../app/content/map/resorts.ts): Scotland 5, France 10, Switzerland 10, Austria 10, Italy 5, USA 16, Canada 4, Japan 8, Scandinavia 7, Southern Hemisphere 10, Rest 15. Compact factory + `S` season presets keep edits region-scoped.

### Tokens
- No new tokens added. Status dot colours bind to existing `--brand-pine / --brand-glacier / --brand-rust` triplets; bar fill uses `--ink` / `--rule-strong`; chips use `border-rule`.
- Avoided the Tailwind opacity trap throughout — brand-triplet access via `rgb(var(--brand-*))` inline styles, `--rule-strong` for the hollow-badge border, no `bg-ink/[α]`.
- Token drift check: PASS (2 pre-existing LEGACY entries in `app/ui/sidebar.css`, not touched by this change).

### Map rewiring
- `INITIAL_CENTER` → `[0, 45]`, `INITIAL_ZOOM` → `1.0`. At 1440×900 this shows Western North America, Europe and Japan simultaneously (AC2).
- Reset view returns to that world default. No clustering added — 100 pins read fine at this zoom (A7 holds).
- Legacy Scotland-centric camera is gone. If a persistent "home view" is wanted later, it's a one-line localStorage read in `useState`.

### Deviations
- **StatusBadge announces as `Status: open/in season/out of season/closed`** rather than the shorter `Open` alone — matches the spec intent (AC2 accessibility name) and avoids ambiguity with the pin dot label.
- **Season bar uses CSS grid for month letters** rather than SVG `<text>` elements — grid aligns letters to cell centres per-breakpoint without re-measuring in JS.
- **No specimen for "closed year-round" title strike-through on its own** — the strike-through is applied to the panel title (not the specimen's badge card), so AC5 is covered by the Chamonix/Zermatt panel preview. The specimen card for `CLOSED` state still shows the correct badge appearance.

### Specimen
- Chapter 15 — `Resort Card` — added to [`app/design-system/nav-data.ts`](../../app/design-system/nav-data.ts) under `data` group, rendered in [`app/design-system/page.tsx`](../../app/design-system/page.tsx) as `ResortCard()`. Shows:
  - Four status badges side by side (`OPEN` / `IN SEASON` / `OUT OF SEASON` / `CLOSED`).
  - Three season bars (winter window, summer window, dim variant).
  - Two activity-chip examples (4 items, 7 items with `+ 1 MORE` overflow).
- Verified at `http://localhost:3200/design-system#resort-card` in both themes.

### Where to look in the specimen
Open `/design-system`, scroll to chapter 15 or click `15 · Resort Card` on the right rail. The three sections map 1:1 to the three primitives for review.

Next: `/review-qa` on `world-mountain-resorts`.
