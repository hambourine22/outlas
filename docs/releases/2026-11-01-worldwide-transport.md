# Release — Worldwide transport, world-zoom badges, cursor globe · 2026-11-01

**Slugs:** `transport-icon-key` (worldwide) · `map-cursor` (orbit) · map menu corners · **Commit:** `2bb9837` · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/ · **Deployment:** https://outlas-fvl4m1xgf-hamishs-projects-e7b0c0a0.vercel.app

## What changed
- **Map: transport for every resort.** The nearest mainline train station and the nearest public EV charger to each of the 111 resorts. Outside Scotland they're generated from OpenStreetMap (© OpenStreetMap contributors, ODbL) by `scripts/transport/`; Scotland keeps its hand-picked set, now with distances. That's 89 stations and 98 chargers outside Scotland, plus Scotland's 14 and 13. (`0ff16b9`, data `2bb9837`)
- **Station quality.** Metro, tram and funicular stops are excluded, including any tagged `funicular=yes`. Lift-company stops are dropped (STBAG, SMC, LSF, FLC). North American stations count only with a passenger operator (Amtrak, VIA Rail, UTA…). A hand-checked list covers heritage lines, an event-only halt, stations across closed borders, and Lebanon. Telluride, Big Sky, Revelstoke, Jackson Hole, Sun Valley, Queenstown's three resorts, Las Leñas, Gudauri and Mzaar show no station. Bariloche, Las Leñas, Yabuli, Beidahu and CWC Camsur have no charger within 80 km.
- **World-zoom badges.** Below zoom 7, each resort pin carries its station and charger glyphs just to its right, station first. From zoom 7 in, the points sit at their true positions beneath the pins. Hover cards read, for example, "Train station · 10.4 km from Méribel". A shared station badges every resort it serves.
- **Cursor:** over a pin, an 18px hairline globe fades in round the dot, with two meridians turning (still under reduced motion).
- **Map menu:** the open panel takes the collapsed pill's 20px corners; the collapse button is round.

## Verified
- `qa-gate.sh` ✓ on `0ff16b9` (tsc · lint · tokens · isolated build). Clean worktree at `2bb9837`: full `pnpm build` ✓.
- `preflight.sh` on the clean tree: everything ✓ except **audit ✗** (below) and the headers warning.
- Live 200 on: `/` · `/design-system` · `/motion/resorts` · `/guides` · `/guides/join` · `/rentals` · `/rentals/submit` · `/repairs` · `/repairs/submit` · `/stories`.
- Live smoke, system theme, desktop: badges beside resort pins across North and South America, Europe, the Middle East and Asia at world zoom; the panel collapses to the pill; console clean. On localhost: hover cards on badges and points, the globe, and the zoom-7 hand-over. Not re-checked on prod: phone width and the hover cards.

## Accepted debt
Hamish chose ship-over-red on 2026-11-01. The six transitive packages are unchanged: `cross-spawn`, `zod`, `ws`, `postcss`, `nanoid`, `source-map-js`. `package.json` and `pnpm-lock.yaml` are byte-identical to the previous production. `next.config.mjs` still has no security headers.

## Data caveats
Stations and chargers are what OpenStreetMap holds, filtered as above. Timetables and charger access aren't verified, and distances are straight-line (the sidebar says so). Rerun `scripts/transport/` when resorts change.

## Env / config changes
none

## Rollback
`vercel rollback https://outlas-ds6yc6d6n-hamishs-projects-e7b0c0a0.vercel.app` (previous production, `59640e5`), or `git revert 2bb9837 0ff16b9` and redeploy from a clean worktree.

## Not in this release
The GSAP panel motion (`panel-motion`) and the globe's depth fade are built and tested on localhost but uncommitted.

## Trail
brief `docs/briefs/transport-icon-key.md` (Worldwide) · `docs/briefs/map-cursor.md` · `scripts/transport/README.md`
