# Burn down the silent Tailwind-opacity classes

**Slug:** `opacity-trap-burndown` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** S

## Problem
Thirteen places in the app use Tailwind alpha syntax on a semantic colour — `bg-ink/5`, `bg-canvas/90`, `border-rule/60`, `bg-accent/10`. Every one of them compiles to **no CSS at all**: Tailwind injects alpha as `rgb(var(--x) / α)`, which needs an RGB triplet, and our semantic variables are hex so they can flip per theme. The elements render with no background / no border and nobody notices because there's no build error. The TopBar and drawer scrim in `Nav.tsx` were two of them until `2026-10-31`; the rest are still live.

## Why now
`check-tokens.mjs` now reports these as warnings (rule 4). They should become errors, which needs the existing uses gone first.

## Success signal
`node .claude/skills/review-qa/scripts/check-tokens.mjs` reports zero opacity-trap warnings, and the rule is promoted from `warnings` to `errors` in the script.

## In scope
The current hits (run the script for file:line):
- `app/design-system/page.tsx` — grid specimen cells (`bg-ink/5` ×6) and `bg-accent/10`
- `app/ui/mapbox/MapPreviewSidebar.tsx` — mobile scrim `bg-ink/40`, close button `bg-canvas/90`, two `border-rule/60`
- `app/ui/mapbox/MapMenuSidebar.tsx` — `border-rule/60`
- `app/rentals/submit/RentalSubmitForm.tsx` — sticky footer `bg-canvas/95`
- `app/stories/ski-touring-risk-space/page.tsx` — figcaption `bg-canvas/80`

Fix pattern (already in the system): bake alpha into a semantic token in all three `globals.css` theme blocks + mirror in `design-system.ts` `themes`, then bind with `bg-[var(--token)]`. Tokens that already exist and cover most cases: `--row-hover` (7/8 %), `--row-active` (10/12 %), `--chrome-bg` (90 % canvas), `--scrim` (carbon 40/60 %), `--rule` (15 %). A grid-specimen wash (`--wash`, ink @ 5 %) is the one likely new token. `border-rule/60` → just `border-rule` (rule is already 15 % ink; 60 % of that was never the intent).

## Out of scope
- Brand-name alpha (`bg-pine/20`) — those work, `--brand-*` are triplets.
- Changing the semantic variables to triplets so Tailwind alpha works natively — would mean touching every `var(--x)` consumer; not worth it for 13 sites.

## Seats
- [ ] `/ux` — skipped: no behaviour change
- [ ] `/ui` — runs: swap each site, add `--wash` if needed, verify in both themes (the grid specimen is the visible one)
- [ ] `/review-qa` — runs: gate must show zero opacity-trap warnings; then flip rule 4 to `errors`
- [ ] `/security-ops` — runs: ships with the next release

## Links
- Rule 4 in `.claude/skills/review-qa/scripts/check-tokens.mjs`
- `docs/learnings.md` — the original sidebar-hover incident that found this class of bug
- Fixed examples: `Nav.tsx` TopBar `bg-[var(--chrome-bg)]`, drawer `bg-[var(--scrim)]`
