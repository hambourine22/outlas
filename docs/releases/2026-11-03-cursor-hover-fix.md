# Release — Map cursor: hover fix over pins · 2026-11-03

**Slug:** `map-cursor` · **Commit:** `baf630a` · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/ · **Deployment:** https://outlas-een3rl0ud-hamishs-projects-e7b0c0a0.vercel.app

## What changed
- **Map cursor hover:** the globe now stays on over a pin however the pointer arrives.
  - **Before:** pins, transport points and badges each switched the hover on and off on their own. Mapbox runs each layer's enter and leave separately, in bind order. Moving from a badge straight onto its pin fired the pin's enter and then the badge's leave, so the globe went out over the pin. Closer in, the same happened when the pointer left a station or charger under a pin while still on the pin.
  - **Now:** `map.tsx` tracks the hover layers under the pointer in one set (`hoverLayer`). The cursor is on while anything is in the set.

## Verified
- `qa-gate.sh` ✓ (tsc · lint · tokens · isolated build). Clean worktree at `baf630a`: full `pnpm build` ✓.
- `preflight.sh` on the clean tree: everything ✓ except **audit ✗** (below), plus the headers and detached-HEAD warnings.
- Live 200 on: `/` · `/design-system` · `/motion/resorts` · `/guides` · `/guides/join` · `/rentals` · `/rentals/submit` · `/rentals/submit/success` · `/repairs` · `/repairs/submit` · `/stories` · `/stories/ski-touring-risk-space`.
- **Live check, world zoom:** Sierra Nevada, with two badges. Empty → pin, pin → badge → badge → pin, and a 1px sweep across pin and badges in both directions: all on. Off once the pointer is away. The transport card opens on the badge and closes on the pin.
- **Live check, zoom 10:** the Mer Geilo charger sits under its pin. Sweeps across and down, ±30px, crossed empty map, charger only, both and pin only. The globe was on exactly where a feature is under the pointer and off everywhere else. Console clean.
- Pointer moves were replayed as synthetic events; this session wasn't open in a window, so no real pointer was used.

## Accepted debt
Hamish chose ship-over-red on 2026-11-03. `package.json` and `pnpm-lock.yaml` are byte-identical to the previous production (`cb1dab7`), but newly published advisories have grown the list from six packages to 16 (52 advisories: 34 high, 20 moderate, 3 low, no critical).
- **Build and dev tools:**
  - eslint: `ajv`, `brace-expansion`, `cross-spawn`, `flatted`, `js-yaml`, `minimatch`, `picomatch`
  - tailwind: `glob`, `postcss-selector-parser`, `yaml`
  - postcss: `postcss`, `nanoid`, `source-map-js`
- **Shipped, with no visitor-controlled input:**
  - `ws` (through `@vercel/postgres`, server side)
  - `zod` (through `@vercel/blob`, server side)
  - `protocol-buffers-schema` (through `mapbox-gl`, in the browser)

The fix is being briefed in `docs/briefs/audit-transitive-bumps.md`; that brief needs widening to all 16 packages. `next.config.mjs` still has no security headers.

## Env / config changes
none

## Rollback
`vercel rollback https://outlas-99041eia8-hamishs-projects-e7b0c0a0.vercel.app` (previous production, `cb1dab7`), or `git revert baf630a` and redeploy from a clean worktree.

## Trail
brief `docs/briefs/map-cursor.md`
