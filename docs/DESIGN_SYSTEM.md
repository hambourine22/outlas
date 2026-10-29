# Oütlas — Design System

Living reference for brand tokens, type, surfaces, and UX patterns. The code is the source of truth; this document is for stakeholders who need the rationale without the TypeScript.

Routes: visit `/design-system` on a running dev server for the rendered reference.

## Where the tokens live

| File | Role |
|---|---|
| `app/lib/design-system.ts` | Canonical TS tokens — colours, type scale, spacing, radii, shadows, score dimensions, map legend, principles. |
| `app/globals.css` | CSS variables that mirror the TS tokens, plus `[data-surface=…]` surface rules. |
| `tailwind.config.ts` | Tailwind extends — colour aliases, font families, type scale, radii, shadows. |
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

## Spacing, radii, shadow

A single ladder each. New components reach for an existing rung before adding one.

- **Spacing**: 0 · 2 · 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128 (px).
- **Radii**: `none` · `sm 4` · `md 8` · `lg 16` · `card 20` · `pill ∞`.
- **Shadow**: `resting` (1-dot card lift) · `lifted` (hover / detail panel) · `modal` (sheet / dialog).

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

## Credit

Brand identity by **Tom Lenartowicz / Thrilly**, March 2020.
System build and code tokens by **HUX**.
