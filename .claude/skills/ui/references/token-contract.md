# Token contract

The system is defined in three files that must agree. This document is the map between them and the recipe for changing them safely.

| File | Holds | Consumed by |
|---|---|---|
| `app/lib/design-system.ts` | Canonical TS objects: `colors`, `surfaces`, `themes`, `typography`, spacing, radii, outlines, `scoreDimensions`, map legend, grid, dataviz | The `/design-system` page (renders the tables from these), any TS that needs a value |
| `app/globals.css` | CSS variables (`--brand-*` triplets, semantic tokens), theme blocks, `[data-surface]` rules, `.label/.micro/.chip` utilities, theme-only helpers | Every component, via Tailwind aliases or `var(--x)` |
| `tailwind.config.ts` | Aliases: `colors.canvas → var(--canvas)`, font families, type scale, radii, shadows, `darkMode: ["class", '[data-theme="dark"]']` | Utility classes (`bg-canvas`, `text-ink-muted`, `border-rule`, `rounded-pill`) |

A value present in one file and absent from another is a bug: the page will document one thing and components will render another.

---

## Brand palette (theme-independent)

| Token | Hex | RGB triplet | CSS var | Role |
|---|---|---|---|---|
| sand | `#FFEF9E` | `255 239 158` | `--brand-sand` | Rental surfaces, warm paper |
| carbon | `#1E1E1E` | `30 30 30` | `--brand-carbon` | Primary ink, dark canvas, footer |
| snow | `#FFFFFF` | `255 255 255` | `--brand-snow` | Light canvas, ink on dark |
| rust | `#C55045` | `197 80 69` | `--brand-rust` | Repair surfaces, warnings, low scores |
| pine | `#22604A` | `34 96 74` | `--brand-pine` | Light accent, CTAs, map strokes |
| glacier | `#94D1D9` | `148 209 217` | `--brand-glacier` | Story surfaces, dark accent |

Components never use `--brand-*` directly except to derive an alpha tint when no semantic token exists (`rgb(var(--brand-carbon) / 0.07)`), and even then the preferred move is to add a semantic token.

## Semantic tokens (flip per theme)

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--canvas` | `#FFFFFF` snow | `#1E1E1E` carbon | Never full black |
| `--canvas-raised` | snow | carbon | Same as canvas — separate with rules, not fill |
| `--ink` | carbon | snow | |
| `--ink-muted` | carbon @ 60% | snow @ 60% | Secondary text |
| `--ink-faint` | carbon @ 35% | snow @ 35% | Tertiary, disabled, inactive nav |
| `--rule` | carbon @ 15% | snow @ 15% | Hairlines, card edges |
| `--rule-strong` | carbon @ 40% | snow @ 40% | Emphasised dividers |
| `--accent` | `#22604A` pine | `#94D1D9` glacier | Pine is illegible on carbon |
| `--row-hover` | carbon @ 7% | snow @ 8% | Sidebar / list hover wash |
| `--row-active` | carbon @ 10% | snow @ 12% | Current item wash |
| `--background`, `--foreground` | → canvas / ink | | Legacy aliases for the Mapbox sidebar |

Tailwind aliases (check `tailwind.config.ts` for the live list): `canvas`, `canvas-raised`, `ink`, `ink-muted`, `ink-faint`, `rule`, `rule-strong`, `accent`, plus the brand names as `rgb(var(--brand-x) / <alpha-value>)` so `bg-pine/20` *does* work for brand names (they're triplets) even though `bg-ink/20` does not (hex).

## Surfaces (theme-independent UX moments)

| `data-surface` | `--canvas` | `--accent` | `--ink` | Used on |
|---|---|---|---|---|
| `rental` | sand | pine | carbon | Rental storefronts, inventory |
| `repair` | rust | snow | snow | Repair storefronts, service pages |
| `story` | glacier | pine | carbon | Editorial, resort profiles |
| `manifest` | sand | pine | pine | Splash, manifesto, hero bands |
| `carbon` | carbon | sand | snow | Footer, inverted sections |

A surface deliberately looks the same in light and dark mode — the moment is the brand. Nest one inside a dark page and it keeps its tone.

## Type scale

| Token | Size | Face | Use |
|---|---|---|---|
| `display-1` | clamp(2.5rem, 5vw + 1rem, 4.5rem) | Vollkorn | Hero, splash |
| `display-2` | clamp(2rem, 3.5vw + 1rem, 3.25rem) | Vollkorn | Section / chapter titles |
| `title` | 1.75rem | Vollkorn | Card titles |
| `section` | 1.25rem | Vollkorn | Sub-sections |
| `body` | 1rem | Vollkorn | Default |
| `label` | 0.75rem · 0.08em · uppercase | Archivo Narrow 700 | UI chrome (`.label`) |
| `micro` | 0.6875rem · 0.10em · uppercase | Archivo Narrow 500 | Meta, chips (`.micro`, `.chip`) |

Fonts are local (`app/fonts/`) via `next/font/local`, exposed as `--font-vollkorn`, `--font-archivo`, `--font-geist-mono`. No network font calls.

## Space · radii · outlines · shadow

- **Spacing ladder (px):** 0 · 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128. Tailwind's default scale covers these (`p-1`=4 … `p-32`=128); avoid `p-5` (20px) and `p-7` (28px) — off the ladder.
- **Radii:** `none 0` · `hairline 2` · `sm 4` · `md 6` · `chip ∞` · `pill ∞`. UI maxes out at `md`; `chip`/`pill` only for status chips and score pills.
- **Outlines:** `hairline` carbon @ 12% · `rule` @ 20% · `strong` @ 60% · `inverse` snow @ 30%.
- **Shadow:** `modal` only. Cards, nav, panels use hairlines.

## Grid

12 columns at `xl` (1280), 8 at `lg` (1024), 6 at `md` (768), 4 at `sm` (640), 2 base. Margin 4% of the shortest side, rounded to 4px; gutter 2 × margin. Chapter headers split 5/7 at `lg`.

---

## Recipe — add a semantic token

Say the spec needs a "selected chip" wash. Do all five steps; the gate script checks 2–4.

1. **Name it by role.** `--chip-selected`, not `--carbon-10`. If it's a tint of ink, consider whether `--row-active` already covers it.
2. **`globals.css` — three blocks.**
   ```css
   :root                                { --chip-selected: rgb(30 30 30 / 0.10); }
   :root[data-theme="dark"]             { --chip-selected: rgb(255 255 255 / 0.12); }
   @media (prefers-color-scheme: dark)  { :root:not([data-theme="light"]) { --chip-selected: rgb(255 255 255 / 0.12); } }
   ```
   (Add the line inside the existing blocks rather than opening new ones.)
3. **`design-system.ts` — mirror it** under `themes.light` / `themes.dark` with a comment, so the Themes chapter documents it.
4. **`tailwind.config.ts` — alias it** if you want a utility: `"chip-selected": "var(--chip-selected)"` under `colors`. Skip this if you'll bind with `bg-[var(--chip-selected)]` — either is fine; be consistent within a component.
5. **Specimen.** Show it in the relevant chapter in both themes.

Then `node .claude/skills/review-qa/scripts/check-tokens.mjs`.

## Recipe — add a brand-coloured component (no new token)

Use the surface or semantic token, not the hex:

```tsx
// ✓ story hero — surface rebinds the tokens, both themes handled
<section data-surface="story" className="bg-canvas text-ink">
  <h2 className="text-display-2">…</h2>
  <p className="text-ink-muted">…</p>
</section>

// ✗ never
<section className="bg-[#94D1D9] text-[#1E1E1E]">
```

## Theme-block checklist (for review)

For every semantic variable in `:root`:
- [ ] Also in `:root[data-theme="dark"]`
- [ ] Also in `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`
- [ ] Mirrored in `design-system.ts` `themes`
- [ ] If aliased in Tailwind, the alias name matches the variable name

`check-tokens.mjs` automates the first two and the "does `var(--x)` exist" check; the last two are a read.
