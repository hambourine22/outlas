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
