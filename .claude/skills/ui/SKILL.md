---
name: ui
description: The UI seat of the Oütlas factory — designs and builds components, pages, layouts, themes and tokens inside the Oütlas design system (Next.js 14 + Tailwind 3.4 + CSS variables, six brand colours, light/dark/system). Use this for any request to build, style, restyle, theme or "make it look right" — component, page section, hover/active/focus state, dark mode, icon, spacing, typography, specimen chapter in /design-system, Tailwind class, CSS variable, or "match the design system / the TwelveLabs reference". Also use it when a colour isn't one of the six brand hexes, when a token needs adding, when something looks right in light but not dark, or when a hover state "isn't showing". Reads the spec in docs/specs/<slug>.md first when one exists.
---

# UI — build seat

You turn a spec into pixels and code that live inside the system — not beside it. The code is the source of truth: `app/lib/design-system.ts` (TS tokens), `app/globals.css` (CSS variables + theme flips), `tailwind.config.ts` (aliases). If a decision isn't in those three files, it isn't in the system, and the next component will drift.

Before you touch code, read the spec (`docs/specs/<slug>.md`) if one exists. If it doesn't and the change is more than a tweak, say so — `/factory` sizes it and `/ux` writes one. For an S-size change (a state, an icon, a spacing fix) proceed, and record intent in the commit message.

## The contract you build inside

Six colours. Two faces. One ladder. Three theme states. Every rule below has been broken on this repo at least once, which is why it's here.

**Colour.** Sand `#FFF6C3` · Carbon `#1E1E1E` · Snow `#FFFFFF` · Rust `#B04B50` · Pine `#2F5349` · Glacier `#ADCFD3`. Nothing else, ever — not a grey, not a 50% black, not a Tailwind `gray-200`. Tints come from alpha on a brand colour (`rgb(30 30 30 / 0.07)`), never from a seventh hex. Components reach for **semantic** tokens (`--canvas`, `--ink`, `--ink-muted`, `--ink-faint`, `--rule`, `--rule-strong`, `--accent`, `--row-hover`, `--row-active`), never raw brand triplets — semantic tokens flip per theme; brand triplets don't.

**Themes.** `<html data-theme="light|dark">`, absent = system. Every semantic token is defined three times in `globals.css`: in `:root`, in `:root[data-theme="dark"]`, and inside `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) … }`. Miss the third and System mode on a dark OS breaks while your Light/Dark toggle tests pass. Dark canvas is Carbon, never `#000`. Dark accent is Glacier (Pine vanishes on Carbon).

**Theme-matched assets.** Use `.theme-light-only` / `.theme-dark-only` for paired images (logotype green/white, Ü-mark green/blue) — Tailwind's `dark:` is attribute-only here and ignores System mode. The medallion and the typemark always carry the same colour: Pine in light, Snow in dark. One lockup, two assets.

**Type.** Vollkorn for editorial and body (`font-serif` default). Archivo Narrow for UI chrome via `.font-ui`, `.label` (700, uppercase, 0.02em), `.micro` (500, 11px, uppercase). Labels ≤ 2 words. Geist Mono only for code and numerics.

**Space, radii, depth.** Power of 4: every length is a multiple of 4px (spacing ladder 0·4·8·12·16·24·32·40·48·64·80·96·128). Radii: `none 0 · hairline 2 · sm 4 · md 6`; `chip`/`pill` (∞) only for status chips and score pills — Oütlas is editorial, rectangles stay rectangular. Depth comes from hairline rules (`border-rule`, `.hairline-rule`), not shadows; shadow is reserved for modal sheets.

**Grid.** 12 columns at `xl`, collapsing 8 → 6 → 4 → 2. Margin 4% of shortest side rounded to 4px; gutter double the margin. Chapter headers split 5/7 at `lg`.

**Surfaces.** `data-surface="rental|repair|story|manifest|carbon"` on a section rebinds `--canvas/--accent/--ink` for that UX moment, in both themes. Children style against the semantic tokens and never name the colour. UX names the surface; you apply it.

Full tables, the three-file sync recipe and the "add a token" walkthrough: `references/token-contract.md`.

## The Tailwind opacity trap (read this one twice)

`bg-ink/[0.05]`, `text-ink/60`, `border-ink/20` **silently produce no CSS** in this project. Tailwind injects alpha by rewriting `rgb(var(--x) / α)`, which needs the variable to be an RGB triplet — ours (`--ink: #1E1E1E`) are hex so the browser can swap them per theme. The class compiles to nothing, there's no build error, and it looks fine in a screenshot because the scroll-spy active state (set another way) was visible.

Do this instead:

```css
/* globals.css — alpha baked into a semantic variable, three times */
:root                              { --row-hover: rgb(30 30 30 / 0.07); }
:root[data-theme="dark"]           { --row-hover: rgb(255 255 255 / 0.08); }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --row-hover: rgb(255 255 255 / 0.08); } }
```
```tsx
// component — arbitrary value, compiles cleanly, flips per theme
className="hover:bg-[var(--row-hover)]"
```

If you ever need a brand colour at alpha without a semantic token, `bg-[rgb(var(--brand-carbon)/0.07)]` works because `--brand-*` *are* triplets — but prefer adding a semantic token so dark mode is handled.

## How to work

1. **Read the spec, then the system.** Open `docs/specs/<slug>.md`. Then `app/design-system/page.tsx` to see what primitives and chapters exist — `Nav.tsx` (TopBar, Sidebar with collapsible groups, OnThisPage), `Chart.tsx` (Line/Bar/Radar + legend), `ThemeSwitcher.tsx`, `.chip` / `.label` / `.micro` utilities. Most "new" components are a composition of these.
2. **Sketch structure before styling.** Write the JSX tree or an ASCII box diagram in the UI note first. Decide the surface, the grid columns, and which rungs of the ladder you'll use. Styling a wrong structure is the expensive mistake.
3. **Tokens first, in all three files.** If the spec needs a value that isn't a token, add it to `design-system.ts`, `globals.css` (×3 theme blocks) and `tailwind.config.ts` before writing the component. Run `node .claude/skills/review-qa/scripts/check-tokens.mjs` — it flags off-brand hexes, semantic tokens missing a dark value, and `var(--x)` references that don't exist.
4. **Build the component.** Server component unless it holds state or uses browser APIs (then `"use client"`). Images through `next/image` with real `width`/`height` from the asset (Ü-mark 904×1314, logotype 2213×478) so there's no layout shift. Interactive elements are real `<button>`/`<a>` with `aria-*` where state isn't visible — `aria-expanded`/`aria-controls` on disclosures, `role="radiogroup"` on segmented toggles, `aria-current="page"` on the active nav item.
5. **Add the specimen.** New component or pattern → a chapter in `app/design-system/page.tsx`, registered in `nav-data.ts` under Foundations / Components / Data, showing every state the spec lists (default, hover, active, empty, error) in both themes if they differ. The specimen is how review and future-you see it without reading code.
6. **Verify in the browser, then in the stylesheet.** Dev server: the `outlas-dev` launch config (`pnpm next dev -p 3200`). Check light, dark *and* system (toggle the OS or emulate `prefers-color-scheme`), then phone width. For any hover/active/focus claim, confirm the rule exists — `getComputedStyle(el).backgroundColor` after a synthetic `mouseover`, or search `document.styleSheets` for the class. Screenshots show what rendered, not what will render for a user.
7. **Append the UI note and hand off.** Add `## UI note` to the spec: structure chosen, tokens added, any deviation from the spec and why, what to look at in the specimen. End with `Next: /review-qa on <slug>`.

## Naming and classes

Tailwind utilities for layout and one-off composition; custom classes in `globals.css` `@layer components` only when a pattern repeats (`.chip`, `.label`). Name custom classes by **role**, not appearance — `.chip` not `.rounded-outline-tag`. If the team adopts CEL naming for custom classes (`context__element--layer`, `data-cel-*` attributes), the `cel-audit` skill checks compliance; until then, role-named and flat.

Commit messages: `Area: imperative summary` — `Sidebar: pack each group into a collapsible disclosure`.

## Boundaries

- You own structure, tokens, states, responsive behaviour, motion and the specimen.
- You don't change acceptance criteria. If one can't be met inside the system, append to the spec under `## UI note → Deviations` and flag it; UX decides.
- You don't deploy and you don't self-certify — `/review-qa` runs the gate and the browser matrix; `/security-ops` ships.
- Don't add a dependency for a component. The system is deliberately small (Next, React, Tailwind, mapbox-gl, @vercel/postgres); a date-picker library is a design decision for `/factory`.

## References

- `references/token-contract.md` — full token tables, three-file sync, add-a-token recipe, theme-block checklist.
- `references/component-checklist.md` — the pre-handoff checklist (copy into the UI note and tick).
- `docs/DESIGN_SYSTEM.md` — rationale for stakeholders.
- `hux-ux-skills` phase 4 (critique) — if asked to review a design rather than build one.
- Previous seat: `/ux`. Next seat: `/review-qa`. Orchestrator: `/factory`.
