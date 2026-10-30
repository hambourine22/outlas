# Design System v2 — Deploy Report · 2026-10-30

## TL;DR

Oütlas Design System v2 is live at **https://outlas-ds.vercel.app/design-system** — editorial art direction, light/dark/system themes, 4×4 Power-of-4 grid, strict six-colour brand palette, and a Data Viz chapter. Source lives in your own GitHub (`hambourine22/outlas`), deployed to a dedicated Vercel project (`outlas-ds`) that is independent of the production `outlas.vercel.app` instance.

## Live URLs

- **Design System**: https://outlas-ds.vercel.app/design-system
- **Project root** (landing shell — map disabled, no DB connected): https://outlas-ds.vercel.app
- **GitHub source**: https://github.com/hambourine22/outlas
- **Vercel project dashboard**: https://vercel.com/hamishs-projects-e7b0c0a0/outlas-ds

## What's in the design system

- **Voice** — Share gear · Buy less · Ride more + manifesto
- **Logo** — Ü mark and wordmark in all six brand colours, aspect ratio locked (904 × 1314 mark, 2213 × 478 logotype)
- **Palette** — Sand, Carbon, Snow, Rust, Pine, Glacier with HEX, RGB and CMYK
- **Themes** — Light, Dark and System, all three built strictly from the six brand colours (dark canvas is Carbon #1E1E1E, never full black)
- **Grid & Layout** — 4×4 → 12 columns, 4% margin, 2×4% gutter, 4px base unit
- **Surfaces** — `data-surface` attribute binds rental / repair / story / manifest / carbon moments
- **Type** — Vollkorn for editorial, Archivo Narrow for UI chrome, with a chapter-size display rung
- **Space, radii, outlines** — Power-of-4 spacing, flattened radii (max 6px for UI, chip and pill reserved for status), hairline outlines in place of drop shadows
- **Principles** — Four load-bearing rules behind every surface
- **Providers** — Three-circle taxonomy (parts, products, service)
- **Score pills** — 0–5 band → brand-colour pill, 12 resort dimensions
- **Map legend** — Transport + Features vocabulary shared across every regional map
- **Data Viz** — Line, bar, radar primitives; chip-tagged series legend; solid Carbon axes with hairline dashed grids; brand-only series cycle

## Stack & deploy details

| | Value |
| --- | --- |
| Framework | Next.js 14.2.14 (App Router) |
| Runtime | Node 22.x |
| Fonts | Local TTFs via `next/font/local` — Vollkorn + Archivo Narrow (no Google Fonts network call) |
| Styling | Tailwind 3.4 + CSS variables; `data-theme` attribute flips semantic tokens |
| Theme persistence | `localStorage` key `outlas:theme` with a pre-paint bootstrap script (no flash of wrong mode) |
| Vercel project | `outlas-ds` (team: Hamish's projects) |
| Deploy trigger | Manual CLI (one-off) — see follow-up to enable auto-deploy |

## Version control history

All commits are on `main` at https://github.com/hambourine22/outlas.

| SHA | Message |
| --- | --- |
| `56f3cf8` | Baseline: initial mirror of the Tom Husband / hamishduncanUX code into your repo |
| `942fe18` | Initial Oütlas design system — tokens, Vollkorn + Archivo, brand assets |
| `4f390c2` | Design system v2 — editorial, themed, 4×4 grid, dataviz |
| `0dee5a8` | Normalise themes and dataviz to strict brand palette |
| `415ac14` | Tighten padding on provider cards |
| `231b3ea` | Make home dynamic and degrade gracefully without Postgres |

## Follow-up — one 30-second step for you

The Vercel project is deployed, but auto-deploy on `git push` isn't connected yet because Vercel's GitHub integration needs you to grant it repo access manually (I couldn't do this one for you — it needs a click from your account).

**To enable auto-deploy on push**:

1. Open https://github.com/apps/vercel/installations/new
2. Choose the `hambourine22` account
3. Grant access to the `outlas` repo (or "All repositories" if easier)
4. Then in the Vercel dashboard, go to the `outlas-ds` project → Settings → Git → Connect to `hambourine22/outlas`

After that, every push to `main` triggers an auto-deploy; preview branches get preview URLs.

Until then, I can re-deploy manually with `vercel --prod` from the repo folder on request.

## Known limitations

- **No database** — the map at `/` can't fetch resorts; the home page falls back to a landing shell with a link to the design system. Wiring Vercel Postgres (or swapping to the Airtable spec from the original BUILD_SPEC) is a follow-up.
- **Non-brand hexes in Mapbox pins** — `app/ui/mapbox/map.tsx` still uses pure CSS colour names (red / blue / green / yellow pins). Easy future PR.
- **Prod `outlas.vercel.app` untouched** — the main production project still deploys from Tom's `hamishduncanUX/outlas` repo. Repointing it to your fork is a separate decision.

## Credit

- Brand identity: Tom Lenartowicz / Thrilly, March 2020
- System v2: HUX, October 2026
