# Release — Cursor globe: feathered orbit trails · 2026-11-02

**Slug:** `map-cursor` · **Commit:** `cb1dab7` · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/ · **Deployment:** https://outlas-99041eia8-hamishs-projects-e7b0c0a0.vercel.app

## What changed
- **Map cursor:** the hover globe is now three comet-like orbit trails flowing round the dot: the equator and two tilted ±60°.
  - Each trail is brightest and thickest at its head and fades along its length to nothing: opacity (1 − t)^1.8, stroke 1.4 → 0.3 px.
  - The far side of each orbit sits back at 0.45.
  - The globe is 30px with no outer outline. Heads run once per 2.6 s with a slight ease.
  - It's drawn on a canvas, only while it shows. Reduced motion draws one still frame.
- **Readouts:** latitude, longitude and zoom ease 7px outward on hover to clear the globe (280 ms, quart).
- **CSS:** the old SVG meridian keyframes are gone from `globals.css`.

## Verified
- `qa-gate.sh` ✓ (tsc · lint · tokens · isolated build). Clean worktree at `cb1dab7`: full `pnpm build` ✓.
- `preflight.sh` on the clean tree: everything ✓ except **audit ✗** (below) and the headers warning.
- Live 200 on: `/` · `/design-system` · `/motion/resorts` · `/guides` · `/guides/join` · `/rentals` · `/rentals/submit` · `/repairs` · `/repairs/submit` · `/stories`.
- **Live check:** hovered a resort pin at All of Scotland. The canvas is 34px (30 + stroke room) and animating, the readouts are shifted 7px, and the console is clean. An 8× preview of three frames 430 ms apart shows the three feathered trails and no outline.
- **Localhost:** the loop stops after the fade-out and the readouts return.
- Not checked on prod: light and dark themes (the globe's colours are fixed rust on the light basemap).

## Accepted debt
Hamish chose ship-over-red on 2026-11-02. The six transitive packages are unchanged: `cross-spawn`, `zod`, `ws`, `postcss`, `nanoid`, `source-map-js`. `package.json` and `pnpm-lock.yaml` are byte-identical to the previous production. The fix is being briefed in `docs/briefs/audit-transitive-bumps.md`. `next.config.mjs` still has no security headers.

## Env / config changes
none

## Rollback
`vercel rollback https://outlas-bute5bqzg-hamishs-projects-e7b0c0a0.vercel.app` (previous production, `3af46dc`), or `git revert cb1dab7` and redeploy from a clean worktree.

## Trail
brief `docs/briefs/map-cursor.md`
