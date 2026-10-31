# Release · 2026-10-31 · first-live-domain-move

**Slug:** `first-live-domain-move` · **Commit:** `6f4a77f` · **Project:** `outlas-ds` · **Live:** https://outlas-ds.vercel.app/

## What changed

- **Security: `next` 14.2.14 → 14.2.35; `eslint-config-next` 14.2.14 → 14.2.35.** Clears GHSA-f82v-jwr5-mffw (middleware auth bypass). The two reachable criticals (GHSA-2xp9-vwfh-vxw4 AVIF image-opt RCE; GHSA-*** SVG image-opt RCE) remain — both fixed only in Next 15.5.24 / 15.5.28. Tracking in [docs/briefs/next-upgrade-15.md](../briefs/next-upgrade-15.md).
- **`app/lib/data.ts` imports `server-only`.** A future client-component import of the DB module now fails the build instead of shipping Postgres code to the browser.
- **No app behaviour change.** All 16 routes compile, 5 static-generated, 11 server-rendered. Same page sizes within 1 kB.

## Verified

- Build in isolated worktree at `6f4a77f`: ✓ compile · ✓ types · ! one lint warning (`app/rentals/submit/FileDropZone.tsx:63` — `aria-invalid` on `role="button"`; non-blocking, kept for follow-up).
- `preflight.sh` **shipped RED** — three critical `pnpm audit` advisories against `next` persist until Next 15 lands (see Accepted debt). Headers warning and worktree-detached-HEAD warning are expected.
- Live `HTTP/2 200` on: `/`, `/design-system`, `/guides`, `/rentals`, `/repairs`, `/stories`, `/stories/ski-touring-risk-space`.
- `<title>` strings render correctly on home and `/design-system`.
- Deployment URL: `https://outlas-i6nhwxd5s-hamishs-projects-e7b0c0a0.vercel.app` · aliased to `https://outlas-ds.vercel.app` · build 56 s.

## Env

- **No env changes in this release.** Vercel production holds only `NEXT_PUBLIC_MAPBOX_TOKEN` on `outlas-ds`.
- **Missing env for submission flows (routes return 200 but POSTs will crash):**
  - `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME` — `app/api/rentals/submit`, `app/api/repair-submit`, `/guides/join`.
  - `BLOB_READ_WRITE_TOKEN` — rental photo uploads. May auto-inject when a Vercel Blob store is attached to the project.
  - `RESEND_API_KEY`, `OUTLAS_NOTIFY_EMAIL` — submission notification emails.
  - Vercel Postgres (`POSTGRES_URL*`) — not referenced by name; auto-injected when the Postgres integration is attached.
- To add any of them: `vercel env add <NAME> production` (prompts for value — never paste in chat), then `vercel --prod --yes` to redeploy.

## Accepted debt (ship-over)

Hamish override, matching the pattern of 2026-10-31 `world-mountain-resorts`:

- `pnpm audit --prod` RED on three `next` criticals. Two are reachable here (6 files use `next/image`). Permanent fix: Next 15.5.24+ via [docs/briefs/next-upgrade-15.md](../briefs/next-upgrade-15.md) — an M-size brief that already exists and is next in the queue.
- `next.config.mjs` has no `headers()`. Baseline snippet in `.claude/skills/security-ops/references/runbooks.md`; needs its own XS brief (`security-headers-baseline`).
- CSP not yet attempted. Shipped as `Content-Security-Policy-Report-Only` first per runbook — out of scope for this ship.

## Rollback

```bash
# Instant alias flip to the previous READY production deployment:
vercel rollback --scope hamishs-projects-e7b0c0a0
# or pick explicitly:
vercel ls outlas-ds --prod                 # list prod deploys
vercel rollback <prev-url>                 # alias flip
```

Previous production deployment on `outlas-ds`: `https://outlas-1v58mgp96-hamishs-projects-e7b0c0a0.vercel.app` (2026-10-30, pre-security-patch).

## Domain cutover — next step, outside this release

User brief: "get this live pronto · add a custom domain." Two moves, both in Vercel UI (dashboard clicks, I don't have write access for either from this session):

1. **Move the `outlas.vercel.app` alias from the stale `outlas` project to `outlas-ds`:**
   - Vercel → `outlas` → Settings → Domains → `outlas.vercel.app` → **Remove**.
   - Vercel → `outlas-ds` → Settings → Domains → **Add** `outlas.vercel.app`.
   - Alias flips within ~60 s. Rollback: reverse the two steps.
2. **Attach the custom domain** (not yet named — likely `outlas.cc`):
   - Vercel → `outlas-ds` → Settings → Domains → **Add** `<domain>` → follow DNS instructions (A/CNAME + ACME TXT).

The old `outlas` project still holds the May 2025 build at `outlas-git-main-hamishs-projects-e7b0c0a0.vercel.app` for history.

## Follow-ups

- **M · `next-upgrade-15`** — exists. The one that clears the preflight to green.
- **XS · `security-headers-baseline`** — add `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, Mapbox-aware `Content-Security-Policy-Report-Only`.
- **XS · `env-prod-wire`** — add Airtable / Resend / Blob env vars so submission flows live.
- **XS · `aria-invalid-on-button-role`** — the lint warning on `FileDropZone.tsx:63`.

## Learning

- A within-minor Next patch (14.2.14 → 14.2.35) was clean — no code changes, no behaviour drift. Worth running one of these any time a new 14.2.x drops, independent of the 15.x upgrade.
- `vercel env ls` is a cheap habit to run before a production deploy; a build-time env is baked in and a runtime-missing env fails at the first POST. We shipped routes that render but crash on submit; `env-prod-wire` is now the follow-up to light them up.
- The isolated-worktree deploy pattern worked exactly as the runbook describes: six parallel seats' in-progress files in the shared tree stayed untouched; the worktree built the exact SHA on disk; `vercel --prod --yes` from the worktree aliased in 56 s.
