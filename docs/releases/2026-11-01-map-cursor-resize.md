# Release — Map cursor: smaller dot, greyed readout · 2026-11-01

**Slug:** `map-cursor` · **Commit:** `b040123` · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/ · **Deployment:** https://outlas-gt3hmgmtl-hamishs-projects-e7b0c0a0.vercel.app

## What changed
- **Map cursor: 8px dot**, down from 22px, growing 1.2× to 9.6px over a pin. Even grown it stays under the smallest pin, which is 10px across at world zoom. (`b040123`)
- **Map cursor: readout greyed.** LATITUDE / LONGITUDE / ZOOM move from solid carbon to carbon at 60 %, the muted rung; the dot stays full rust. (`b040123`)

## Verified
- Token gate ✓ and `tsc --noEmit` ✓ on the shared tree; localhost:3200 computed styles 8px dot, `scale(1.2)` over a pin, readout `rgba(30, 30, 30, 0.6)`.
- Clean worktree at `b040123`: full `pnpm build` ✓.
- `preflight.sh` on the clean tree: everything ✓ except **audit ✗** (below) and the headers warning.
- Live 200 on: `/` · `/design-system` · `/motion/resorts` · `/guides` · `/guides/join` · `/rentals` · `/rentals/submit` · `/repairs` · `/repairs/submit` · `/stories`.
- Live browser smoke, system theme, desktop: dot 8px, readout `rgba(30, 30, 30, 0.6)`, reads LATITUDE −20.6328 · LONGITUDE 75.7617 · ZOOM 1.00. Console clean.

## Accepted debt
Hamish chose ship-over-red on 2026-11-01. The six transitive packages are the same as in `2026-11-01-map-transport-and-cursor`: `cross-spawn`, `zod`, `ws`, `postcss`, `nanoid`, `source-map-js`. `package.json` and `pnpm-lock.yaml` are byte-identical to the previous production. The fix stays an XS `pnpm update` + overrides brief. `next.config.mjs` still has no security headers.

## Env / config changes
none

## Rollback
`vercel rollback https://outlas-n3jhsf3n2-hamishs-projects-e7b0c0a0.vercel.app` (previous production, `d5cb163`), or `git revert b040123` and redeploy from a clean worktree.

## Trail
brief `docs/briefs/map-cursor.md`
