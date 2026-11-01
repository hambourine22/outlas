# Release — Transport pins, map cursor, region picker · 2026-11-01

**Slugs:** `transport-icon-key` (pins on the map) · `map-cursor` · `regions-current-card` · **Commit:** `d5cb163` · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/ · **Deployment:** https://outlas-n3jhsf3n2-hamishs-projects-e7b0c0a0.vercel.app

## What changed
- **Map: transport pins.** The 14 ScotRail stations and 13 ChargePlace Scotland points render as square carbon plates with the snow hairline glyph, beneath the provider circles, from zoom 5. Hover (or tap) shows the name and the resort each one serves. (`3702053`)
- **Sidebar: Transport is live.** Each kind toggles like a provider row, the key swatch is the map's plate, and the pin count and Hide/Show all include transport. The "✦ Spring 26" chip is gone. (`3702053`)
- **Map cursor.** Over the map the pointer is a rust dot reading latitude to its left, longitude to its right and zoom beneath. It grows over a pin and is hidden on touch devices. (`3702053`)
- **Back on prod:** the region picker with camera flyTo and the transport icon key. Both had been live only from a working-tree deploy and dropped off with the clean anatomy release. Committed as `3249ec0`, docs `078e16b`.
- Docs: transport-icon-key "Pins on the map" section, new `map-cursor` brief, `DESIGN_SYSTEM.md` notes (`d5cb163`).

## Verified
- `qa-gate.sh` ✓ (tsc · lint · tokens · isolated build) on the shared tree before commit.
- Clean worktree at `d5cb163`: full `pnpm build` ✓.
- `preflight.sh` on the clean tree: env ✓ · secrets ✓ · NEXT_PUBLIC_ ✓ · raw HTML ✓ · `server-only` ✓ · SQL ✓ · artefacts ✓ · **audit ✗** (below) · headers warning.
- Live 200 on: `/` · `/design-system` · `/motion/resorts` · `/guides` · `/guides/join` · `/rentals` · `/rentals/submit` · `/repairs` · `/repairs/submit` · `/stories`.
- Browser smoke on the live site, system theme, desktop: region picker flies to All of Scotland, transport plates render, cursor reads LATITUDE / LONGITUDE / ZOOM 6.50, console clean. Phone (375px): Transport rows fit on one line, cursor hidden (no hover), no horizontal overflow. Light and dark themes, the hover card and the toggles were checked on localhost:3200 before commit, not again on prod.
- Not run: an independent `/review-qa` seat.

## Accepted debt
Hamish chose **ship over red** on 2026-11-01. `package.json` and `pnpm-lock.yaml` are byte-identical to the previous production (`db4f39c`), so this release adds no exposure. `pnpm audit --prod` (high+) now flags six transitive packages. The list is longer than the anatomy release's four because advisories were published since, not because dependencies changed:
- `cross-spawn` <7.0.5 and `zod` <4.6.6, via `@vercel/blob › @vercel/oidc`
- `ws` <8.21.0, via `@vercel/postgres`
- `postcss` ≤8.5.17, `nanoid` <3.3.18 and `source-map-js` <1.2.2, via `next › postcss`

The fix is a `pnpm update` + overrides pass (XS brief). `next.config.mjs` still has no security headers (XS brief).

## Env / config changes
none

## Rollback
`vercel rollback https://outlas-k5elm36v4-hamishs-projects-e7b0c0a0.vercel.app` (previous production, release `anatomy` at `db4f39c`), or `git revert 3702053` and redeploy from a clean worktree.

## Process
Deployed from a clean `git worktree` at `d5cb163` per the runbook. The shared tree's uncommitted files (`docs/briefs/next-upgrade-15.md`, `docs/releases/2026-10-31-world-mountain-resorts.md` edits, `docs/releases/2026-10-31-rental-submission-form.md`) did not ship.

## Trail
briefs `docs/briefs/transport-icon-key.md` · `docs/briefs/map-cursor.md` · `docs/briefs/regions-current-card.md`
