# Oütlas — Design System

Living reference for brand tokens, type, surfaces, and UX patterns. The code is the source of truth; this document is for stakeholders who need the rationale without the TypeScript.

Routes: visit `/design-system` on a running dev server for the rendered reference.

## Where the tokens live

| File | Role |
|---|---|
| `app/lib/design-system.ts` | Canonical TS tokens — colours, type scale, spacing, radii, shadows, score dimensions, map legend, principles, grid, dataviz. |
| `app/globals.css` | CSS variables that mirror the TS tokens, plus `[data-surface=…]` surface rules and `[data-theme=…]` theme flips. |
| `tailwind.config.ts` | Tailwind extends — colour aliases, font families, type scale, radii, shadows. |
| `app/design-system/Nav.tsx` | `TopBar`, `Sidebar`, `OnThisPage` navigation primitives with built-in scroll-spy. |
| `app/design-system/nav-data.ts` | Single source for the chapter list and the three groups (Foundations / Components / Data). |
| `app/design-system/ThemeSwitcher.tsx` | Three-way Light / System / Dark toggle. |
| `app/design-system/Chart.tsx` | SVG `LineChart`, `BarChart`, `RadarChart` + `ChartLegend` primitives. |
| `public/brand/` | Logotype and Ü-mark PNGs in all six brand colours. |
| `app/fonts/` | Vollkorn and Archivo Narrow TTFs loaded via `next/font/local`. |

If a design token changes, update **all three** of `design-system.ts`, `globals.css`, and `tailwind.config.ts`. A token that only lives in Tailwind is a bug.

## Voice

| Line | Role |
|---|---|
| Share gear. | Verb — the behaviour. |
| Buy less. | Reason — the climate case. |
| Ride more. | Reward — the payoff. |

Manifesto: *"We connect riders to low carbon methods, in the protection of natural habitats, harnessing the power of the outdoor community."*

Tagline (one-line fallback): *"Share gear. Buy less. Ride more."*

## Palette

Six colours. Named roles — not Pantone names — because the roles are what we style against.

| Token | Hex | Role |
|---|---|---|
| `sand` | `#FFF6C3` | Rental surfaces, splash backgrounds, warm paper. |
| `carbon` | `#1E1E1E` | Primary ink, dark surfaces, footer. |
| `snow` | `#FFFFFF` | Neutral surface, ink on dark surfaces. |
| `rust` | `#B04B50` | Repair surfaces, warnings, "Lack of" low scores. |
| `pine` | `#2F5349` | Accent, CTAs ("Join the movement"), map strokes. |
| `glacier` | `#ADCFD3` | Story surfaces, resort hero bands, editorial panels. |

CMYK and RGB triplets are carried in `design-system.ts` for print work.

## Surfaces

A **surface** is a UX-moment theme: a background, an accent, and an ink colour applied as CSS variables under one `data-surface` attribute. The children style against `var(--surface)`, `var(--accent)`, `var(--ink)` so a child component never names a colour.

| `data-surface` | Used on |
|---|---|
| `rental` | Rental storefronts, inventory listings. |
| `repair` | Repair storefronts, service pages. |
| `story` | Editorial content, resort profiles, long-form. |
| `manifest` | Splash, manifest intro, hero bands. |
| `carbon` | Footer, dark splashes, inverted sections. |

Example:

```tsx
<section data-surface="rental">
  <h2>Patagonia PowSlayer Bibs</h2>
</section>
```

## Typography

Two faces. Both are local — loaded from `app/fonts/` via `next/font/local` so there is zero network dependency on Google Fonts.

| Family | File root | Role |
|---|---|---|
| Vollkorn | `app/fonts/vollkorn/` | Editorial display and body. Carries storytelling. 400/400i/600/700. |
| Archivo Narrow | `app/fonts/archivo/` | UI labels, meta, nav chrome, button text. All-caps `.label` utility. 400/500/600/700. |
| Geist Mono | `app/fonts/GeistMonoVF.woff` | Code and numerics. Legacy. |

Type scale lives in `typography.scale` and in Tailwind `fontSize`:

| Token | Size | Use |
|---|---|---|
| `display-1` | clamp(2.5rem, 5vw + 1rem, 4.5rem) | Hero lines, splash. |
| `display-2` | clamp(2rem, 3.5vw + 1rem, 3.25rem) | Section titles, article headers. |
| `title` | 1.75rem | Card titles, resort name. |
| `section` | 1.25rem | Sub-section labels. |
| `body` | 1rem | Default. |
| `label` | 0.75rem · tracking 0.08em · uppercase | UI chrome. |
| `micro` | 0.6875rem · tracking 0.10em · uppercase | Meta, pills. |

## Iconography

Hairline glyphs on a **24-unit grid**, drawn inside a 3–21 safe area: stroke 1.6, round caps and joins, `currentColor` (so an icon flips with `--ink` and takes the surface's ink), no fills except dots. Sizes are ladder rungs — 12 (chrome), 16 (inline with 14–16px type), 20 (touch), 24 (hero). The token is `iconography` in `design-system.ts`.

One registry, one renderer: `app/ui/icons/icons.ts` holds the geometry (`ICONS`, grouped into `ui` · `activity` · `feature` · `transport`), `app/ui/icons/Icon.tsx` draws it — `<Icon name="ski" size={16} />`. Beside text an icon is decoration (aria-hidden); when it *is* the meaning, pass `label` and it becomes `role="img"`. Nothing is drawn inline in a component; add to the registry and the Iconography chapter documents it.

The map's transport glyphs (`TransportIcons.tsx`) keep a 16-unit grid of their own because they also serialise to Mapbox bitmaps; the 24-grid `train` and `ev` are the same drawings redrawn for lists and the legend. `LEGEND_ICON` maps every `mapLegend` key to an icon so the legend chapter and any future map key read the same glyph.

## Spacing, radii, shadow

A single ladder each. New components reach for an existing rung before adding one.

- **Spacing**: 0 · 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128 (px). Every rung is a multiple of **4**.
- **Radii**: `none 0` · `hairline 2` · `sm 4` · `md 6` · `chip ∞` · `pill ∞`. Oütlas is editorial, not web-app — rectangles stay rectangular. Only status chips and score pills curve.
- **Outlines**: `hairline` (0.12 carbon) · `rule` (0.2 carbon) · `strong` (0.6 carbon) · `inverse` (0.3 snow).
  Oütlas prefers hairline outlines over drop shadows — depth comes from surface tone, not elevation. Drop shadow is reserved for `modal` only (sheets, popovers, dialogs).

## Grid & layout — Power of 4

A **4×4 structure** forms a 12-column grid. The grid scales down to 6, 4, 3 or 2 columns at narrower viewports. Every length rounds to the nearest multiple of 4px.

| Token | Value | What it means |
|---|---|---|
| Columns | 12 (4×4) | Base at desktop. Collapses to 6, 4, 3, 2. |
| Margins | 4% of shortest side | Rounded to nearest 4px. |
| Gutter | 2 × 4% = 8% | Twice the margin — uniform both sides. |
| Base unit | 4px | Spacing, type, radii all land on a multiple of 4. |

Breakpoints (`grid.breakpoints`):

| Rung | Min width | Columns | Use |
|---|---|---|---|
| base | 0 | 2 | Phone — stack sections, ladder content. |
| sm | 640 | 4 | Large phone / small tablet. |
| md | 768 | 6 | Tablet — two editorial columns. |
| lg | 1024 | 8 | Small laptop — chapter headers split 5/7. |
| xl | 1280 | 12 | Desktop — full 4×4 grid. |

## Themes — light, dark, system

Three modes:

- **System** (default). `prefers-color-scheme` decides. No `data-theme` on `<html>`.
- **Light**. Forced via `<html data-theme="light">`. Canvas `snow #FFFFFF`, ink `carbon #1E1E1E`, accent `pine #2F5349`.
- **Dark**. Forced via `<html data-theme="dark">`. Canvas `carbon #1E1E1E` (never full black), ink `snow #FFFFFF`, accent `glacier #ADCFD3` (pine goes too dark on carbon).

Both themes are built strictly from the six brand colours. Nothing new, nothing picked by eye. Cards don't change fill from canvas — depth and separation come from hairline rules (`carbon @ 15%` on light, `snow @ 15%` on dark).

A blocking inline script in `app/layout.tsx` applies the stored preference before paint to avoid a flash of the wrong mode. The `ThemeSwitcher` component in `app/design-system/ThemeSwitcher.tsx` persists the choice to `localStorage` under the key `outlas:theme`.

Brand surfaces (`data-surface=…`) are theme-independent — rental is always sand, repair is always rust. The UX moment should feel the same in either mode.

### Nav mark rule — typemark and medallion colours must match

The Ü medallion in the TopBar always carries the same brand colour as the Oütlas typemark next to it. One signature, one tone — the mark and the wordmark are a single lockup, split across the bar.

- Light theme → both pine (`#2F5349`).
- Dark theme → both snow (`#FFFFFF`).

Anywhere else the medallion appears (specimens, documentation, mockups), the same rule holds. Never swap one asset for a different brand colour than the other.

## Principles

1. **Decluttered components** — chrome stays minimal; story and product visuals lead the eye.
2. **Theming with colour & type** — each UX moment binds to a surface across the whole buying flow.
3. **Familiar UX patterns** — the mobile Story pattern is the backbone for product and resort narratives.
4. **Going fullscreen** — PLPs open on an editorial cover (2:3 ratio, transparent header).

## Providers

Three circles. Every supplier maps to exactly one.

| Tone | Provider | Marker |
|---|---|---|
| Rust | Parts Manufacturer | Rust circle. |
| Pine | Products Manufacturer | Pine circle. |
| Glacier | Service Provider | Ü mark overlaid. |

## Resort score

Resort pillars are rendered as 0–5 pills. Band colours:

| Range | Band | Surface | Ink |
|---|---|---|---|
| 0–1 | Very poor | `rust` | `snow` |
| 1–2 | Poor | `rust` | `snow` |
| 2–3 | Fair | `sand` | `carbon` |
| 3–4 | Good | `pine` | `snow` |
| 4–5 | Very good | `carbon` | `snow` |

Full dimension list (12) lives in `scoreDimensions` and renders in the Score panel.

## Map legend

Transport: EV · Train · Sail.
Features: Ski · Hike · Bike Trails · Fishing · Kayak · Birding · Rock Climbing · Wild Swimming · Camping.

Shared across the Scotland map and every regional map that follows.

## Map pins

One circle per record, **fill only — no outline**. The fill is the category colour at full opacity. Sharpness comes from integer radii that step with zoom (5px at world view → 7px at continent → 9px from zoom 8), not from a stroke: a translucent 1px stroke is all anti-alias fringe and reads soft, and an opaque ring (tried at 2px and 1.5px) read heavy against the editorial basemap.

| Category | Fill | Role |
|---|---|---|
| Resorts | `pine` | Product destination |
| Rentals | `glacier` | Service provider |
| Repairs | `rust` | Parts manufacturer |
| Guides | `sand` | Human expertise |

Tokens live in `mapPins` (`design-system.ts`). `CATEGORY_COLOUR` in `app/content/map/types.ts` derives from it, the `locations` circle layer in `app/ui/mapbox/map.tsx` draws it, and the sidebar pin key, provider table and token-less placeholder reuse the same fill so key and map never drift. In the sidebar key a filtered-out category shows its fill at 30 % rather than a hollow ring.

**Transport pins** are the bare 16px hairline glyph from `TransportIcons.tsx`, with no plate: the outline is the mark, and a line drawing can't be mistaken for a filled provider circle. The ink is fixed carbon, because the basemap is light in both themes. A 1px snow halo under each stroke keeps the outline legible over roads and water. Every resort has its nearest station and charger (OpenStreetMap; Scotland's are hand-picked). They come at two scales, handing over at zoom 7. Below 7 they're **badges**: the resort's station and charger glyphs at 0.6 scale, 13px and 24px right of its pin, station always first, drawn above the circles and hidden with the Resorts filter. Most points are within a few km of their resort, so at world zoom they'd otherwise sit under its pin. From 7 in they're the points themselves at their true positions, drawn beneath the provider circles. The sidebar key shows the same outline in `--ink`. Tokens: `mapTransport`.

**Map menu corners.** Both states share one 20px radius: the collapsed rail is a 40px pill (20px caps), and the open panel takes the same 20px corners, so collapsing and expanding read as one object changing size.

**Collapsed map rail** — a 40px pill on the 4px ladder. The open chevron is a 32px circle inset 4px, concentric with the top cap. 15px of bottom padding puts the last pip's centre exactly as far from the bottom (21px, border included) as the chevron's is from the top, concentric with the bottom cap, so both ends match. The four 10px category pips sit on an 18px pitch, with 4px extra above the first to set the control apart from the key.

**Map cursor.** Over the map the system pointer is replaced by an 8px rust dot reading `LATITUDE` (4 dp) to its left, `LONGITUDE` (4 dp) to its right and `ZOOM` (2 dp) beneath. It's set in Archivo Narrow caps with tabular figures, in carbon at 60 % (the muted rung, fixed rather than theme-flipped). Over a pin the dot grows 1.2× to 9.6px, still smaller than the smallest pin (10px at world zoom), and an 18px rust hairline globe fades in round it: outline, equator, and two meridians a quarter-turn apart turning every 2.4 s. With reduced motion set, the globe holds one still meridian. It's hidden on devices without hover. Tokens: `mapCursor`.

## Anatomy

One contoured shape per resort that brings its numbers together — drawn the same way for every resort, with fixed domains, so two glyphs anywhere on the site compare at a glance. The form follows the kind of place: **mountains rise above the line; seas drop below it.** Mountain and surf are built; the others are reserved with their encodings so the family grows without a redesign.

| Reads as | Mountain (built) | Surf (built) | Snowdome (reserved) | Cable park (reserved) |
|---|---|---|---|---|
| Height | peak altitude, above the line | water depth offshore, below the line | indoor vertical | — |
| The ink band | base → peak, contours every 200 m | the trough, contours every 500 m | the slope | the cable loop |
| Width | pisted km | surfable coast, km | slope length | cable length |
| Rungs | lifts, on the lift line | town population, one per 1,000, on the shore | lifts | obstacles |

Contours are drawn as **rings seen from a low angle** (`anatomy.ring`: vertical radius 0.24 × horizontal, far half at 0.35 opacity) — the oblique view of the motion art direction — so a peak reads in the round and a trough reads as a funnel; ring extremes sit exactly on the outline, so the silhouette and the rings are one geometry. One axis each, nothing doubled; everything else is a readout, not geometry.

**Two scales.** `scale="fixed"` draws on the comparability frame — for glyphs side by side. `scale="fit"` (the default, and what the resort preview uses in its 1 : 1 `aspect="square"`) snaps each axis to the smallest rung of a ladder that holds the value (`anatomy.ladder`: 1 000 · 1 500 · 2 000 · 3 000 · 4 000 m; 20 → 400 km; depth and coast ladders for surf), so a resort alone in a small square fills its frame and resorts of the same class share a rung. The tick and the bar drawn on every glyph say which scale it is, and the square version prints it under the drawing — a map always carries its scale bar. Domains: mountain 4000 m × 400 km, with the foot below the base drawn faint — you can see it, you can't ski it; surf 5000 m × 5 km (Nazaré's canyon sets the depth frame). Surf records live in `app/content/map/surf.ts` and are curated, approximate figures — the UI says so. Tokens in `anatomy` (`design-system.ts`); geometry in `app/lib/anatomy.ts`; the SVG primitive `ResortAnatomy` (`app/ui/ResortAnatomy.tsx`) and the motion piece share it.

## Motion

Animated data pieces follow one art direction, taken from the "Anatomy" strata sheet: hairlines, dashed leaders, a 4:5 frame, a loop. The tokens live in `motion` (`design-system.ts`) and are JS-only; a piece reads them directly. The first piece, **Anatomy of a resort** at `/motion/resorts`, is one mountain reshaping into the next — each resort holds for `motion.anatomy.dwell`, morphs over `motion.anatomy.morph`.

| Token | Value | Notes |
|---|---|---|
| `frame` | 1080 × 1350 | 4:5 portrait; export sizes 1080 / 1440 / 2160 |
| `loop` · `morph` · `drawIn` | 8 s · 1.6 s · 1.2 s | a recorded clip; a fold; marks appearing |
| `anatomy.dwell` · `anatomy.morph` | 1.6 s · 0.8 s | a resort holds; it reshapes into the next |
| `ease` | power2.inOut — `cubic-bezier(0.45, 0, 0.55, 1)` | |
| `view.oblique` | shear 0.42 · squash 0.3 | the strata view; `isoAxis` 30° for a true isometric |
| `lean` | 60° | leader angle from the horizontal |
| `stroke` | line 1 · rule 0.5 · leader 0.75 dashed 6/5 · grid dashed 2/4 | CSS px on the 1080 frame |
| `opacity` | cells 0.03 · grid 0.3 · rules 0.55 · leaders 0.7 · marks 0.9 · playhead 0.75 | |

Colour is never a motion token. A piece reads `--canvas`, `--ink`, `--ink-muted`, `--ink-faint`, `--rule` and `--accent` at draw time — so it follows light, dark and system — and takes one emphasis colour from `dataviz.series`. Type comes from the `next/font` variables (`--font-vollkorn`, `--font-archivo`, `--font-geist-mono`). Layout on the Power-of-4 ladder: margin 4 % of the short side to the nearest 4.

Record an 8 s clip (MP4 / WebM) or save a still from the page; hold any single resort to export its glyph.

## Credit

Brand identity by **Tom Lenartowicz / Thrilly**, March 2020.
System build and code tokens by **HUX**.
