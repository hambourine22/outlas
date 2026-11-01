# Map menu — Regions as a full-width current card

**Slug:** `regions-current-card` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** S

## Problem
Regions is buried in the stack as a collapsed future-group row with a `ALL OF SCOTLAND` hint chip. That treatment is right for Features and Transport (they're wholly future), but Regions already has a live state — "where am I viewing" — so burying it costs the user the most useful piece of context on the panel. The question *"what am I looking at the map of?"* should be answered at the top of the panel, not six rows down.

## Why now
Hamish's direct ask: *"Build out the regions section with a full width of the map symbols panel and a heading 3 for the name underneath with an eyebrow for the region."*

## Success signal
Opening the Map Symbols panel on `/`, the first thing the eye lands on is a full-width card reading **REGION / All of Scotland** — eyebrow caps above, editorial heading below — before any filter row. The three future-group collapsibles (Features / Transport) remain below Providers. No pins visibly change.

## In scope
- `app/ui/mapbox/MapMenuSidebar.tsx` only.
- Remove `regions` from `FUTURE_GROUPS`.
- Add a new `RegionCurrent` section at the top of the open-state panel body, below the "Map symbols" header and above `ProviderGroup`.
- Layout: full width of the 288px panel, eyebrow `.label` on top, `<h3>` in Vollkorn below, hairline rule at the bottom.
- Content: eyebrow `Region`; heading `All of Scotland` (static for now).
- Small `✦ Soon — filter by region` affordance line so the future-state is honest without taking space from the primary text.

## Out of scope
- No region picker interaction yet (that's a future brief).
- No change to `app/content/map` types; no new data.
- No change to Providers / Features / Transport sections.
- No change to the collapsed-rail pip legend.

## Seats
- [ ] `/ux` — skipped (direct art direction from Hamish; no acceptance criteria to generate).
- [ ] `/ui` — runs
- [ ] `/review-qa` — runs
- [ ] `/security-ops` — **held behind `next-upgrade-15`** (same preflight gate blocking `nav-right-handed`); ships on the first green preflight afterwards.

## Links
- Current file: [app/ui/mapbox/MapMenuSidebar.tsx](app/ui/mapbox/MapMenuSidebar.tsx)
- Architecture: [docs/MAP_MENU_ARCHITECTURE.md](docs/MAP_MENU_ARCHITECTURE.md) — the Phase 2 wireframe put Regions in the group stack; this brief corrects it based on the user's direct feedback (the current region is primary context, not a future layer).
- Blocked downstream of: [docs/briefs/next-upgrade-15.md](docs/briefs/next-upgrade-15.md)

---

## UI note (seat: `/ui` · 2026-10-31)

### Structure chosen
- New `RegionCurrent` `<section>` at the top of the open panel body, above `ProviderGroup`.
- `aria-label="Current region"` so screen readers announce the role.
- Eyebrow is a `<p className="label text-ink-faint">` — reuses the shared `.label` component class (Archivo Narrow, 700, uppercase, 0.02em).
- Heading is a real `<h3 className="font-serif text-title leading-tight text-ink">` — Vollkorn at 1.75rem on the brand `text-title` rung, snow in dark, carbon in light via `--ink`.
- Future-state hint is `font-mono text-[10px] uppercase tracking-wide text-ink-faint`, `aria-hidden` since the eyebrow + h3 already carry the semantic weight. Matches the "✦ WINTER 25/26" chip language used on the Features / Transport group headers.
- Padding `px-4 pb-5 pt-5` lives on the 4-multiple ladder; airier vertically than the group header rows so the card reads as a card, not a row.
- Removed `regions` entry from `FUTURE_GROUPS`.

### Tokens added
- None. Everything leans on existing primitives: `.label`, `font-serif`, `text-title`, `font-mono`, `--ink`, `--ink-faint`, `--rule`.

### Deviations from the brief
- None.

### Verification done
- `npx tsc --noEmit` clean.
- Browser (localhost:3200, HMR):
  - Light: eyebrow in ink-faint, h3 in carbon Vollkorn, hint in ink-faint mono. ✓
  - Dark: eyebrow in snow-faint, h3 in snow Vollkorn, hint in snow-faint mono — all contrasts fine on carbon canvas. ✓
  - At 288px panel width the heading "All of Scotland" sits on one line with headroom. Any future longer region name (e.g. "Loch Lomond & The Trossachs") will wrap to two lines; `leading-tight` keeps it compact.
  - Panel reflow: PROVIDERS group row position shifts down by one card height; counts still visible without scrolling at desktop. On short viewports the panel's existing `overflow-y-auto` handles it.
- The dropped `regions` entry from `FUTURE_GROUPS` leaves `FEATURES` and `TRANSPORT` as the only two future-group collapsibles — correct.

### What to look at
- Open the Map Symbols panel on `/`. The first thing you see under the "Map symbols" header is the full-width card: `REGION` label on top, `All of Scotland` in Vollkorn below, `✦ SOON — FILTER BY REGION` hint at the bottom. Hairline rule separates it from PROVIDERS.
- Toggle themes — the Vollkorn h3 flips with `--ink`, nothing else needs theme-match utilities here.

Next: `/review-qa` on `regions-current-card`. Release still **held** behind `next-upgrade-15`.

---

## V2 — region filters + camera flyTo (seat: `/ui` · 2026-10-31, same day)

### What Hamish asked after V1 shipped

*"What happened to the region filters being added to the map symbols sidebar? With each filter adjust the map view to show only this region please."*

Fair correction. V1 made Regions a current-region card but left the filter list as a `✦ Soon` affordance (a Medium-confidence Phase 2 assumption). V2 wires it up properly.

### Structure chosen (V2)

- New content layer: [app/content/map/regions.ts](app/content/map/regions.ts) — typed `Region[]` with key, label, Nikolai-voice one-liner, centre `[lng, lat]`, zoom. Seven regions ordered widest to narrowest: Worldwide → All of Scotland → Highlands → Cairngorms → Trossachs → Borders → Islands & Hebrides.
- `RegionCurrent` renamed to **`RegionSection`** — now takes `active: RegionKey` and `onSelect: (key) => void` props.
- The card body still shows eyebrow + h3 + one-liner, all now **dynamic** on `active`.
- Below the card body, hairline rule, then a list of region rows — each a `<button aria-pressed aria-current>` styled with the same `--row-active` / `--row-hover` tokens as the Providers rows. The active row shows a quiet `VIEWING` tag in `font-mono text-[10px]`.
- `map.tsx` gains an `activeRegion` state (default `DEFAULT_REGION = "worldwide"`) and a `handleSelectRegion(key)` that calls `mapRef.current.flyTo({ center: region.centre, zoom: region.zoom })`.
- `handleReset` now also resets `activeRegion` to the default, so the Reset view button and the sidebar's `VIEWING` tag stay in sync.

### Tokens added
None. Reuses `--row-active`, `--row-hover`, `font-mono`, `.label`, `font-serif text-title`, `--ink`, `--ink-muted`, `--ink-faint`.

### Copy — against `docs/COPY_STYLE.md`
Each region's `oneLine` is Nikolai-voice. Audit:
- Worldwide: *"Every resort, rental, repair and guide in the content layer."* — specific, references the taxonomy. ✓
- All of Scotland: *"Five resorts. One good season a year, if we're lucky."* — exact number, admits the trade-off. ✓
- Highlands: *"Nevis Range and the long drives west — the big country."* — names the resort, acknowledges the drive. ✓
- Cairngorms: *"Cairngorm and Aviemore. The one that's open the most."* — names the resort + the town, states the honest advantage. ✓
- Trossachs: *"Glencoe and the loch country — a short drive from Glasgow."* — names the resort, admits the context. ✓
- Borders: *"Not Scotland's ski heartland. Here for completeness."* — the if-not-you warning in one line. ✓
- Islands & Hebrides: *"Skye, Mull, the Outer Hebrides. Not for the lifts."* — names three, warns on the use case. ✓

### Verification done (V2)
- `npx tsc --noEmit` clean.
- Browser (localhost:3200, HMR): clicked Worldwide → Cairngorms → All of Scotland. Camera flew each time (200 ms+ transition), the active row's `VIEWING` tag moved with the selection, the h3 and one-line updated.
- Dark mode: eyebrow in `--ink-faint`, h3 "Cairngorms" in snow Vollkorn on carbon, active row backdrop reads as a quiet lighter block on the carbon panel.
- Reset view button → camera flies back to world, `VIEWING` tag jumps back to Worldwide.

### Deviations from the HUX architecture
The HUX Phase 2 doc put Regions as a filter-by-region (data filter). V2 implements it as a **camera filter** instead — the pins stay in the data, the camera moves. This is what Hamish asked for *("adjust the map view")* and it's simpler to implement, lighter on cognitive load, and the right default: if you zoom into Cairngorms you want to see pins just outside the viewport when you pan. If data filtering is wanted later, we add it on top without replacing this.

### What to look at
- Open the panel on `/`. Default state: Worldwide active, world-view map.
- Click any region row — camera flies, h3 reads the new region's label, one-liner updates, VIEWING tag follows.
- Click Reset view — everything resets to Worldwide.

Next: `/review-qa` on `regions-current-card` (V2). Release still **held** behind `next-upgrade-15`.
