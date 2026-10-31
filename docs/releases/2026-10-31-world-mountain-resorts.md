# Release — World mountain resorts on the map, with status · 2026-10-31

**Slug:** `world-mountain-resorts` · **Commit:** `7d9ee74` · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/

## What changed
- **Map: 100 curated mountain resorts across the world** — Scotland 5, Alps 35 (France 10, Switzerland 10, Austria 10, Italy 5), North America 20 (USA 16, Canada 4), Japan 8, Scandinavia 7, Southern Hemisphere 10, rest of world 15. Up from 5 Scottish pins.
- **Map: world-view camera** — initial centre moved from Scotland (`[-4.2, 57.1]` @ zoom 6.56) to the Atlantic at a northern-biased latitude (`[0, 45]` @ zoom 1.0). First paint shows Western North America, Europe and Japan simultaneously. Reset view returns here.
- **Resort type: operational status + season window + activities** — new fields on `Resorts`: `operational_status: "year-round" | "seasonal" | "closed"`, `season_from`/`season_to` (MM-DD), `activities: Activity[]`, `country`. Activity enum shared from `app/content/map/types.ts` (10 activities: ski, snowboard, splitboard, hike, trail-run, bike, climb, kayak, wild-swim, sail).
- **Pin preview: StatusBadge** — four states (OPEN / IN SEASON / OUT OF SEASON / CLOSED) with brand-colour dot. Status is derived at render time from today vs. the season window; the panel never guesses. OPEN uses `--accent` so it flips pine → glacier on dark canvas.
- **Pin preview: SeasonBar** — 12-cell SVG strip, open months filled in `--ink`, closed months in `--rule-strong`, 2px tick marks the current month above its cell. Legend reads `Season — Mon DD to Mon DD`. Handles cross-year wrap (Dec → Apr).
- **Pin preview: ActivityChips** — hairline-border pills in `font-mono`, max 6 chips with `+ N MORE` overflow.
- **Design system chapter 15 · Resort Card** at `/design-system#resort-card` — four status badges, three season-bar variants, two activity-chip examples. Registered in `nav-data.ts` under the `data` group.

## Verified
- `qa-gate.sh` ✓ (typecheck ✓ · lint ✓ · tokens ✓ · build on Vercel ✓) · LEGACY: 2 pre-existing in `app/ui/sidebar.css`.
- `preflight.sh` **shipped RED** — see **Accepted debt** below. User (Hamish) explicitly chose to ship over the known Next.js advisories and open a follow-up brief.
- Live `HTTP/2 200` on: `/`, `/design-system`, `/stories/ski-touring-risk-space`.
- Browser smoke:
  - **Desktop · system (dark OS):** world map renders with pins across every region ✓. Sidebar footer `111 of 111 pins visible` ✓. Specimen chapter 15 renders four badges + three season bars (12-cell with letters J…D + today marker over O) + overflow chips ✓.
  - **375 px mobile · system:** Palandöken resort panel renders — hero band 16:9, title display-2, `TURKEY · ○ OUT OF SEASON`, 12-cell season bar, `Season — Nov 25 to Apr 5`, three activity chips (SKI / SNOWBOARD / HIKE), no horizontal scroll ✓.
  - **Light theme:** verified in dev before deploy; status badge dot flips pine → glacier per theme via `--accent`.

## Env / config changes
None. The resort dataset is a static TypeScript module compiled into the bundle. `NEXT_PUBLIC_MAPBOX_TOKEN` was already set from the earlier release — no new environment variables.

## Rollback
`vercel rollback` → previous production deployment `outlas-i6p7j4368-hamishs-projects-e7b0c0a0.vercel.app` (shipped earlier today for the map-menu-architecture slug). Or `git revert 7d9ee74 && vercel --prod --yes` to roll back only this slug and leave the factory scaffold in place.

## Accepted debt (preflight warnings and failures shipped over)

Shipped over Hamish's explicit decision — surfaced in the deploy question before deploy.

- **FAIL · `pnpm audit` — 3 critical Next.js advisories on `next@14.2.14`**
  - GHSA-f82v-jwr5-mffw — middleware auth bypass (patched ≥14.2.25). *Latent*: no `middleware.ts` in repo.
  - GHSA-p293-qw3h-jr36 — RCE on Windows-hosted servers (patched ≥15.5.24). *Not reachable*: Vercel runs Linux.
  - GHSA-2xp9-vwfh-vxw4 — RCE via AVIF in Image Optimization API (patched ≥15.5.24). *Low practical reachability*: the app uses `next/image` for static ship-time files only; no user-uploaded AVIF path exists.
- **WARN · `app/lib/data.ts` lacks `import "server-only"`** — a future client import would ship DB code to the browser; add the one-line guard in the next change that touches data.
- **WARN · `next.config.mjs` has no security headers** — baseline snippet exists in `.claude/skills/security-ops/references/runbooks.md`.
- **WARN · uncommitted working tree at preflight time** — resolved; two commits now in `main` (`917d01d` factory scaffold + prior map work, `7d9ee74` this slug).

**Follow-up briefs to open** (not opened here — would be their own factory slugs):
1. `next-upgrade-15` — bump `next` from 14.2.14 to ≥15.5.24 to clear all three advisories (medium work — Next 15 has breaking changes in App Router APIs, dynamic APIs and caching defaults).
2. `data-ts-server-only` — add `import "server-only"` to `app/lib/data.ts` (XS).
3. `security-headers-baseline` — add the baseline header set to `next.config.mjs` (XS).

## Trail
brief `docs/briefs/world-mountain-resorts.md` · spec `docs/specs/world-mountain-resorts.md` · review `docs/reviews/world-mountain-resorts.md`
