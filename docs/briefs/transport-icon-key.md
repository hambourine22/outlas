# Transport layer — icon system + sidebar key

**Slug:** `transport-icon-key` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** M

## Problem
The Transport section of Map Symbols is a stub — a collapsed "✦ SPRING 26" chip with one line of future-state copy. There's no icon vocabulary defined for transport points, no data schema, and no visual key to help a user read a future transport layer at a glance. If we design the icons and seed the data now, the live pin layer (Spring 26 per the architecture) is a quick switch, not a redesign.

## Why now
Hamish shared nine HEIC reference pages — editorial design essays on dimensions, Gestalt and Bauhaus iconography. The vocabulary (hairline construction, geometric primitives, orthogonal strokes, no decorative detail) is a direct fit for Oütlas's hairline economy. Defining the icon system against this reference now locks in a design language before implementation drifts into Material Icons.

## Success signal
Expanding the **TRANSPORT** group in the Map Symbols sidebar reveals a two-row icon key — one row per transport kind — rendered with the new icon components. The icons sit in the design system (added as a chapter in `/design-system`), the data schema is typed and the first ~15 stations + ~12 charge points near the five resorts are seeded in the content layer.

## In scope
- **Icon system** (new primitive): `app/ui/icons/TransportIcons.tsx` — a hairline-stroke SVG component per transport kind. Starting set: `TrainStation`, `ChargePoint`. 1.6px stroke to match the design system, 16×16 viewBox, uses `currentColor`.
- **Content layer**: new `app/content/map/transport.ts` with a typed schema and a seed set of ~15 train stations + ~12 EV charge points, each within reasonable driving distance of one of the five live resorts (Cairngorm, Nevis Range, Glencoe, Glenshee, The Lecht). Coordinates sourced from publicly known station / ChargePlace Scotland locations.
- **MapMenuSidebar**: replace the generic `FutureGroupSection` treatment for `transport` with a dedicated `TransportSection` that shows the icon key (icon + label + count) when expanded, plus one Nikolai-voice line of context.
- **Design-system chapter**: new chapter documenting the transport icon vocabulary with specimens in both themes.
- Scope the icons' *data* kind to only two for now (`station`, `charge`); the Sail and Bus kinds that may come later get added when they do.

## Out of scope
- No live pins on the map yet (that's the Spring 26 architecture step — needs new render path for line geometry, dual-category rendering).
- No `MapCategory` type change — transport is its own axis, not a provider.
- No new Mapbox layer added to `map.tsx` — this brief ends at the sidebar key.
- Features and Regions sections unchanged.
- No change to the "near a resort" rule's definition — the content layer notes an owning resort per transport point for now; a true proximity query lands when PostGIS is wired.

## Seats
- [ ] `/ux` — skipped (direct art direction, clear acceptance criteria in the brief).
- [ ] `/ui` — runs
- [ ] `/review-qa` — runs
- [ ] `/security-ops` — **held behind `next-upgrade-15`** (same gate blocking `nav-right-handed` and `regions-current-card`).

## Links
- References: `/Users/hamishduncan/Documents/Oütlas.cc/D | Oütlas Reference/IMG_7172.HEIC` through `IMG_7180.HEIC` — editorial essays on dimensions, Gestalt and Bauhaus iconography. The icon system reads from the vocabulary of pages 59, 65 and 89.
- Design system: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), [app/design-system/page.tsx](app/design-system/page.tsx).
- Copy voice: [docs/COPY_STYLE.md](docs/COPY_STYLE.md) — Transport section copy must pass "would Nikolai say it like this?".
- Architecture: [docs/MAP_MENU_ARCHITECTURE.md](docs/MAP_MENU_ARCHITECTURE.md) — Transport is listed as a Spring 26 layer.

---

## UI note (seat: `/ui` · 2026-10-31)

### Structure chosen
- New file [app/ui/icons/TransportIcons.tsx](app/ui/icons/TransportIcons.tsx) — a shared `Svg` wrapper that sets `viewBox="0 0 16 16"`, `stroke="currentColor"`, `strokeWidth={1.6}`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `aria-hidden`. Two glyphs: `TrainStation` (orthogonal train profile — rounded rectangle body + vertical door divider + two filled wheel circles) and `ChargePoint` (four-segment zigzag lightning bolt, open path, no fill).
- Vocabulary pulled from the IMG_7172–IMG_7180 reference pages: hairline construction, geometric primitives, orthogonal strokes preferred over diagonals, uniform weight. No decorative detail; functional silhouettes only.
- New file [app/content/map/transport.ts](app/content/map/transport.ts) — typed `TransportKind` and `TransportPoint`, seeded with **14 stations** and **13 charge points** (one more each than the brief estimated — Perth and Lochaber Leisure Centre earned their place). Each point carries `nearest` (free-text resort name) until a PostGIS proximity query lands.
- `MapMenuSidebar.tsx` — pulled `transport` out of `FUTURE_GROUPS` and gave it a dedicated **`TransportSection`** component with:
  - Header: `TRANSPORT` label-caps + `✦ Spring 26` hint chip + chevron. Matches the FutureGroupSection header language so the row still reads as "planned," not live.
  - Expanded body: one-line Nikolai-voice copy, then the icon key as a two-row list. Each row: 16px icon (`currentColor`) + label + count + palette note (`the useful stops` / `ChargePlace Scotland`). No toggle — these aren't filters yet because the pins don't render.

### Tokens added
None. The icons use `currentColor` so they flip with `--ink` per theme. Row layout reuses the exact spacing, font and colour tokens as the Providers rows.

### Copy — against `docs/COPY_STYLE.md`
- Expanded-body line: *"Train stations and EV charge points within useful range of the five Scottish resorts. Pins arrive in Spring 26 — the key reads now."* Facts: train stations, EV charge points, five resorts, Spring 26. Admits the limit (`pins arrive in Spring 26`) in the same breath as the value (`the key reads now`). ✓
- Palette notes: `the useful stops`, `ChargePlace Scotland`. Specific, no superlatives, name the real network. ✓

### Deviations from the brief
- The icon set is TWO glyphs only (`station`, `charge`), as scoped. `Sail` and `Bus` glyphs don't exist yet — brief said they'd be added when the data lands.
- Icon system does not get its own `/design-system` chapter in this pass — it would otherwise be ten lines showing the two icons, and the icons are documented in the file comment. XS brief if a chapter is wanted later.

### Verification done
- `npx tsc --noEmit` — my diff clean. At the time, a pre-existing error in another session's motion file (`ResortsMotion.tsx`, since removed — the motion piece is now `app/motion/resorts/AnatomyMotion.tsx`) was the only tsc output.
- Browser (localhost:3200, HMR, dark theme, world zoom): scrolled sidebar to the Transport section, clicked to expand. Header shows chip + chevron; body reveals one-liner + both key rows with 16px hairline icons rendering snow-on-carbon.
- Count displays: 14 stations, 13 charge points, in `font-mono text-xs text-ink-faint`.
- Icon strokes read cleanly at 16px — no AA fringe on the orthogonals, wheels sit on the baseline without touching the rect body.

### What to look at
- Open the Map Symbols panel on `/`. Scroll past Features to TRANSPORT.
- Click to expand. The hairline icons appear at the left of each row.
- Toggle to Light theme — icons flip to pine-on-snow via `currentColor`.

### What's next (not in this brief)
- Spring 26: wire the content layer into the Mapbox GL layer so stations and charge points render as pins alongside the four provider categories. At that point the TransportSection rows become toggles (same pattern as ProviderRow).
- Content pass: tighten coordinates against the OS 1:50k and the ChargePlace Scotland API, add connector detail per charge point, add Sail routes if the Spring 26 data lands with ferries.

Next: `/review-qa` on `transport-icon-key`. Release still **held** behind `next-upgrade-15`.

## Pins on the map — 2026-11-01

Asked for: Hamish — "I want these train stations and EV points added to the map." That moves the out-of-scope line "No live pins on the map yet" into scope ahead of Spring 26. Point geometry only; routes (lines), timetables and Sail stay Spring 26.

### Structure chosen
- **Layer:** a `transport` GeoJSON source and a `symbol` layer in [app/ui/mapbox/map.tsx](../../app/ui/mapbox/map.tsx), drawn **beneath** the provider circles (`beforeId: "locations"`) so a charge point at a resort's base car park never covers the resort pin. Hidden below zoom 5. At the Worldwide preset only providers show; at All of Scotland (6.5) the transport points appear.
- **Plate:** an 18px square, carbon fill, with the snow hairline glyph inset at 12px. It's square so it never reads as a provider circle. The basemap is light in both site themes, so the plate is fixed rather than theme-flipped. Icon size steps 0.75 → 1 between zoom 5 and 9. Mapbox's collision pass hides overlapping plates at low zoom (Aviemore station / Aviemore Village) and shows both closer in.
- **One geometry source:** [app/ui/icons/TransportIcons.tsx](../../app/ui/icons/TransportIcons.tsx) now holds each glyph as data (`GLYPHS`). The React components draw it for the sidebar key, and `glyphMarkup` serialises it for the map's bitmaps (rasterised at 2× in `loadTransportImages`). The key and the map can't drift.
- **Sidebar:** `TransportSection` is live. The "✦ Spring 26" chip is gone, the section is open by default, and each row is a toggle (`aria-pressed`, line-through + 25 % plate when off), the same pattern as `ProviderRow`. The key swatch is the map's plate. "X of Y pins visible" and Hide/Show all now include transport.
- **Hover card:** name, then `TRANSPORT_LABEL · near {nearest}`. A Mapbox popup restyled in `globals.css` (`.transport-card`: `--canvas`, `--rule`, square, no tip, no shadow). Click opens it too, because touch has no hover. A click anywhere else closes it.

### Tokens added
`mapTransport` in `design-system.ts`: plate, glyph, px, glyphPx, stroke, minZoom, size.

### Copy — against `docs/COPY_STYLE.md`
- Section line: *"ScotRail stations and ChargePlace Scotland points near the five Scottish resorts. They show once you zoom to Scotland. Positions are approximate, so check the operator before you rely on one."* It names the networks, says where the pins appear, and admits the coordinates are approximate.
- `TRANSPORT_NOTE.charge`: "ChargePlace Scotland" → "ChargePlace". The full name wrapped the 288px row onto two lines, and the paragraph above already says it in full.

### Verification done
- `tsc --noEmit` clean; `next lint` clean on the changed files; `qa-gate.sh` (see the commit).
- Browser (localhost:3200, dark and light): at All of Scotland, plates render beneath the circles with legible glyphs. At Cairngorms (zoom 9), plates are at full size. Hovering Spittal of Glenshee shows "Charge point · near Glenshee". Toggling Charge point off removes its 13 plates and reads 204 of 217; toggling it back restores them. The light-theme key plate matches the map. Console clean (apart from the existing basemap `landform` expression warning and the local Postgres env errors, both pre-existing).
- Not run: an independent `/review-qa` seat.

### Still open
- Content pass: tighten coordinates against OS 1:50k and the ChargePlace Scotland API; add connector detail to the hover card.
- The data covers the five Scottish resorts only. The 100 world resorts have no transport points yet.

### Outlines, not plates — 2026-11-01, later
Asked for (Hamish): *"transport icons on the map just as vector outlines not boxes please."* The carbon plate is gone. The map now draws the bare 16px glyph: carbon hairline (1.6) with a 1px snow halo under every stroke, and under the wheels as a ring, so it stays legible where it crosses a road or river. On open basemap the halo is invisible. The sidebar key went back to the bare outline in `--ink`, which matches the map's mark (fixed carbon there, because the basemap is light). Tokens: `mapTransport` drops `plate` and `glyphPx`, and gains `halo` and `haloPx`; `px` is now the glyph edge, 16.

## Worldwide — 2026-11-01, later

Asked for (Hamish): *"Build out the charging points and train stations nearest all the resorts on the worldwide view."*

- **Data:** `app/content/map/transport-world.ts` is generated from OpenStreetMap (© OpenStreetMap contributors, ODbL) by `scripts/transport/` (see its README). It holds the nearest mainline station (`railway=station|halt`, with metro, tram and funicular stops excluded) and the nearest public car charger (`amenity=charging_station`, with private and bike-only excluded) for every resort outside Scotland. Scotland keeps its hand-picked set, which now has distances too. Each point carries `km` (straight line) and `serves`, the list of resorts it's nearest to.
- **Station quality:** OSM tags plenty of heritage and mountain railways as ordinary stations. The fetch only counts North American stations with a passenger operator (Amtrak, VIA Rail, UTA and the like), drops lift-company stops (STBAG, SMC), and holds a hand-checked `EXCLUDE` list. That list covers heritage lines, funiculars, an event-only halt, and stations across a closed border or in Lebanon. Each resort falls through to its next-nearest real station, or shows none.
- **World view (Hamish's choice):** below zoom 7, every resort pin carries badges, its station and charger glyphs side by side just right of the pin. From zoom 7 in, the points sit at their true positions. Hovering either shows the name and the straight-line distance from the resort.
- **Card:** "Charge point · 3.2 km from Verbier". Unnamed chargers read "Unnamed charger", and generic Korean/Japanese "EV charger" labels fall back to the operator or that.
- **Not verified:** each station's timetable. The data is what OSM says, filtered as above. Distances are straight-line, which the sidebar says.
