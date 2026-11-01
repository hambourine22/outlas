# Release — Transport outlines, collapsed rail pill · 2026-11-01

**Slugs:** `transport-icon-key` · map menu (collapsed rail) · **Commit:** `59640e5` · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/ · **Deployment:** https://outlas-ds6yc6d6n-hamishs-projects-e7b0c0a0.vercel.app

## What changed
- **Map: transport icons as bare outlines.** The carbon plates are gone. Each station and charge point is the 16px hairline glyph in carbon, with a 1px snow halo under every stroke so it stays legible over roads and water. The sidebar key shows the same outline in `--ink`. (`59640e5`)
- **Map menu: collapsed rail is a pill.** 40px wide, `rounded-full`, on the 4px ladder. The chevron is a 32px circle concentric with the top cap. The last pip's centre is 21px from the bottom, matching the chevron's 21px from the top. Pips sit on an 18px pitch. (`59640e5`)

## Verified
- `tsc --noEmit` ✓ · token gate ✓ on the shared tree. On localhost:3200, in light and dark: outlines render with no plates, the pill measures 21px / 21px, and the key rows show outlines.
- Clean worktree at `59640e5`: full `pnpm build` ✓.
- `preflight.sh` on the clean tree: everything ✓ except **audit ✗** (below) and the headers warning.
- Live 200 on: `/` · `/design-system` · `/motion/resorts` · `/guides` · `/guides/join` · `/rentals` · `/rentals/submit` · `/repairs` · `/repairs/submit` · `/stories`.
- Live browser smoke, system theme, desktop, All of Scotland: outline glyphs on the map. Collapsed rail is 40 × 121px, `border-radius: 9999px`, 21px chevron-to-top and last-pip-to-bottom. Console clean.

## Accepted debt
Hamish chose ship-over-red on 2026-11-01. The six transitive packages are the same as the two releases before: `cross-spawn`, `zod`, `ws`, `postcss`, `nanoid`, `source-map-js`. `package.json` and `pnpm-lock.yaml` are byte-identical to the previous production. The fix stays an XS `pnpm update` + overrides brief. `next.config.mjs` still has no security headers.

## Env / config changes
none

## Rollback
`vercel rollback https://outlas-gt3hmgmtl-hamishs-projects-e7b0c0a0.vercel.app` (previous production, `b040123`), or `git revert 59640e5` and redeploy from a clean worktree.

## Trail
brief `docs/briefs/transport-icon-key.md` · `docs/DESIGN_SYSTEM.md` (Map pins: transport pins, collapsed map rail)
