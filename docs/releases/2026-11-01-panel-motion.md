# Release — Panel motion on GSAP, cursor globe depth · 2026-11-01

**Slugs:** `panel-motion` · `map-cursor` (depth fade) · **Commit:** `3af46dc` · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/ · **Deployment:** https://outlas-bute5bqzg-hamishs-projects-e7b0c0a0.vercel.app

## What changed
- **Toolbars and sidebars on GSAP**, in-out quart (`power3.inOut`) over 0.45 s:
  - the map menu's pill ⇄ panel is now one Flip morph with its corners kept round;
  - the resort preview rail and the nav drawer slide, with their scrims fading alongside.
  - Reduced motion snaps.
- **Motion tokens:** `motion.eases.inOutQuart` / `inOutQuint` (GSAP name and CSS curve each) and `motion.panel` `{ ease, duration, fadeIn }`.
- **Cursor globe:** each meridian's near half brightens and its far half dims as it turns, and the equator's far half holds at 0.3. The globe fades in over 280 ms on the panel ease.
- **Fixes:**
  - Closed panels go `visibility: hidden` once off-screen, so they can't hold focus or be tabbed to.
  - The map wrapper is `overflow-clip`: focus left in the closed rail had scrolled the map 448 px sideways.
  - The rail's mobile backdrop uses `--scrim` (`bg-ink/40` compiled to nothing).
- **Deps:** `gsap` 3.15.0, `@gsap/react` 2.1.2 (pinned).

## Verified
- `qa-gate.sh` ✓ (tsc · lint · tokens · isolated build). Clean worktree at `3af46dc`: full `pnpm build` ✓.
- `preflight.sh` on the clean tree: everything ✓ except **audit ✗** (below) and the headers warning.
- Live 200 on: `/` · `/design-system` · `/motion/resorts` · `/guides` · `/guides/join` · `/rentals` · `/rentals/submit` · `/repairs` · `/repairs/submit` · `/stories`.
- **Live timings** (sampled every frame, pane in view):
  - map menu collapse and expand: 408–417 ms visible, 49–50 frames, worst gap 9 ms, within 2.6 % of quart;
  - drawer close: 417 ms, 50 frames, then `visibility: hidden`;
  - console clean.
- One earlier live run stalled partway through because the browser throttled the page while it was in the background. The rerun with the pane in view was clean.
- Localhost timings for the rail and drawer open, and the globe depth samples, are in `docs/briefs/panel-motion.md` and `docs/briefs/map-cursor.md`.
- Not checked on prod: phone width, light/dark.

## Accepted debt
Hamish chose ship-over-red on 2026-11-01. The six transitive packages are unchanged: `cross-spawn`, `zod`, `ws`, `postcss`, `nanoid`, `source-map-js`. The lockfile only adds `gsap` and `@gsap/react`, which have no dependencies and nothing flagged. `next.config.mjs` still has no security headers.

## Env / config changes
none

## Rollback
`vercel rollback https://outlas-fvl4m1xgf-hamishs-projects-e7b0c0a0.vercel.app` (previous production, `2bb9837`), or `git revert 3af46dc` and redeploy from a clean worktree.

## Trail
brief `docs/briefs/panel-motion.md` · `docs/briefs/map-cursor.md`
