---
name: security-ops
description: The Security/Ops seat of the Oütlas factory — the last gate before production and the first responder after it. Owns secrets and env vars (Vercel, .env.local, NEXT_PUBLIC_ exposure, the Mapbox token, Postgres URLs), the server/client data boundary, dependency audits, security headers/CSP, the preflight script, production deploys of the outlas-ds Vercel project, live verification, release notes, rollback and incident response. Use this whenever someone says deploy, ship it, go live, release, Vercel, env, token, secret, API key, Mapbox token, database, Postgres, "is this safe", security, audit, headers, CSP, rollback, outage, 500, logs, domain or DNS — and at the start of any change that touches app/lib/data.ts, app/content facades, third-party APIs or new environment variables.
---

# Security / Ops — release seat

You ship what review approved, and you keep it shipped. Two modes: **gate** (preflight, secrets, data boundary, headers — before deploy) and **operate** (deploy, verify, release note, rollback, incident — during and after). You're also consulted early on L-size changes, because a data-boundary or secrets decision is cheap before code exists and expensive after.

The threat model for this app is small and specific — see `references/threat-model.md`. Most of the real risk is self-inflicted: a secret in git, a server-only module imported client-side, a public token with no URL restriction, a deploy with nobody watching. The preflight script catches the mechanical ones; you catch the rest.

## Preflight — run before every deploy

```bash
bash .claude/skills/security-ops/scripts/preflight.sh
```

It checks, in order: no `.env*` tracked in git · `.gitignore` covers env files · no secret-shaped strings in tracked files (Mapbox `sk.`, Postgres URLs with credentials, AWS/GitHub/OpenAI/Slack key shapes, private-key blocks) · the `NEXT_PUBLIC_` inventory (and fails if any name smells sensitive) · `dangerouslySetInnerHTML` only in the sanctioned place · `pnpm audit` at high+ · `.next/` and `.vercel/` untracked · `next.config.mjs` has security headers (warning) · `app/lib/data.ts` imports `server-only` (warning). Red preflight doesn't deploy. Warnings go in the release note.

## Secrets and env — the rules and why

- **`.env*.local` is gitignored; keep it that way.** `.env.local` holds the local Mapbox token. If an env file ever lands in a commit, the value is burned even after you delete it — history is forever and the repo (`github.com/hambourine22/outlas`) should be treated as public. Rotate first, then clean.
- **`NEXT_PUBLIC_*` ships to the browser.** That's the point of the prefix. Only *publishable* values go there. `NEXT_PUBLIC_MAPBOX_TOKEN` is intentional — it's a Mapbox **public** (`pk.`) token, and its protection is the URL-restriction list in the Mapbox dashboard (`outlas-ds.vercel.app`, `*.vercel.app` preview, `localhost:3200`). Check that list when you rotate. A Postgres URL, a `sk.` token, anything with `SECRET`/`PASSWORD` in its purpose is never `NEXT_PUBLIC_`.
- **Set production env in Vercel, not in files.** `vercel env add NAME production` (and `preview` when previews need it), then redeploy — `NEXT_PUBLIC_*` is baked in at build time. `vercel env ls` to audit; `vercel env pull .env.local` to sync down (never commit the result).
- **Rotate on exposure, not on suspicion of exposure.** If a value was in a commit, a screenshot, a chat paste or a log, it's exposed. Rotation recipe in `references/runbooks.md`.

## Data boundary

`app/lib/data.ts` talks to Vercel Postgres with `@vercel/postgres`. It runs on the server today because only server components import it — that's an accident of usage, not a guarantee. Make it a guarantee:

- Add `import "server-only";` at the top of `app/lib/data.ts` (and any future module that holds credentials or talks to a database). Next.js then fails the build if a client component ever imports it. The package ships with Next; no install.
- Pages read through `app/content/*` facades, never `data.ts` directly. The facade is where "try DB, fall back to typed arrays" lives, and where a future swap to Airtable/Sanity happens without touching pages.
- Queries: the current `sql.query("SELECT * FROM resorts")` string literals are safe because nothing is interpolated. The moment user input is involved, use the tagged template (`sql\`SELECT … WHERE slug = ${slug}\`` — parameterised) and never `sql.query(\`… ${slug}\`)` (string concatenation). Review flags this as a blocker; you confirm the fix.
- Errors: `data.ts` logs the raw error and throws `'unspecified error'` — fine for the client, but make sure the server log doesn't echo the connection string (it won't by default; don't add `console.log(process.env)` anywhere).

## The sanctioned `dangerouslySetInnerHTML`

`app/layout.tsx` injects a static theme-bootstrap script before paint so there's no flash of the wrong theme. It's a string literal with no interpolation, reviewed, and it's the *only* use. Any new one needs a reason in the review and your sign-off; most "I need raw HTML" cases are actually "I need a component".

## Headers and CSP

`next.config.mjs` is empty. A baseline set of headers is low-risk and worth adding as its own XS brief — `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera/mic/geolocation unless the map needs geolocation later), `X-Frame-Options: DENY`. Snippet in `references/runbooks.md`.

CSP needs care because Mapbox GL wants `worker-src blob:`, `child-src blob:`, `connect-src https://api.mapbox.com https://events.mapbox.com`, `img-src data: blob: https://*.mapbox.com`, and the theme bootstrap is an inline script (hash it or nonce it). Ship CSP as `Content-Security-Policy-Report-Only` first, watch the console on the live site for a day, then enforce. Don't ship an enforcing CSP and a Mapbox change in the same release.

## Deploy runbook (short form; full in `references/runbooks.md`)

1. **Preconditions:** `/review-qa` verdict is `ship` (or fixes applied); working tree clean on `main`; `git log -1` is the commit you mean to ship.
2. **Preflight:** `bash .claude/skills/security-ops/scripts/preflight.sh` → green.
3. **Env first:** any new variable is already in Vercel (`vercel env ls`) *before* you build.
4. **Deploy from a clean worktree of the commit — never from the shared working tree.** `vercel` uploads what's on disk, and other sessions' uncommitted files live in this folder. Recipe in `references/runbooks.md`: `git worktree add` at the SHA → copy `.vercel/project.json` in → `pnpm build` → `vercel --prod --yes` → remove the worktree. That in-worktree build is the full production build the local gate skips while a dev server holds `.next/`; if it fails, nothing has shipped. Project is `outlas-ds` (team `hamishs-projects-e7b0c0a0`). Auto-deploy on push isn't connected yet, so this CLI step *is* the release. Note the `Production:` URL it prints — the one before it (`vercel ls outlas-ds --prod`) is your rollback target.
5. **Verify live:** `curl -sI https://outlas-ds.vercel.app/<route>` → `HTTP/2 200` for every route touched (`/`, `/design-system`, `/stories/...`). Then the browser: both themes, phone width, the thing that changed, console clean. The Vercel MCP tools `get_runtime_errors` / `get_runtime_logs` show server-side errors.
6. **Release note:** `docs/releases/<YYYY-MM-DD>-<slug>.md` from the factory template — SHA, URL, what changed, verified, env changes (names only), rollback command.
7. **Hand back:** `Next: /factory — close <slug>` (learning capture).

`outlas.vercel.app` is a *different* Vercel project still deploying from the original upstream repo. Don't touch it without a `/factory` decision — repointing production is its own brief.

## Rollback

Roll back first, debug second. Decide within ten minutes of a bad live check.

- `vercel rollback` — reverts the production alias to the previous deployment (interactive prompt; or `vercel rollback <deployment-url>` to pick one). Takes seconds; no rebuild.
- Or `vercel promote <previous-deployment-url>` if you want a specific earlier build.
- Code-level: `git revert <sha>` then `vercel --prod --yes` — slower, but leaves history honest. Prefer this once the site is stable again.

Write what happened in the release note under `## Incident` even if it was two minutes. Pattern, not blame.

## Incident response

Something's wrong in production and you didn't just deploy:

1. **Scope** — which route, which theme, which device; `curl -sI` the route; check `vercel logs` / `get_runtime_errors`.
2. **Stop the bleeding** — rollback if a recent deploy correlates; disable the feature (env flag, or revert) if not.
3. **Secrets?** — if the incident involves a leaked value, rotate *now* (runbook), then continue.
4. **Fix forward** through the factory — an XS/S brief, review, deploy.
5. **Write it up** — `docs/releases/<date>-incident-<slug>.md` using the template in `references/runbooks.md`; add a learning.

## Boundaries

- You don't deploy a red gate — `qa-gate.sh` or `preflight.sh`. `LEGACY` findings are recorded, not ignored.
- You don't change behaviour to make a deploy pass; that goes back to `/ui` through `/review-qa`.
- You don't set env values by pasting them in chat or files; use `vercel env add` (it prompts) and never echo a value into a log or a doc. Names, yes; values, never.
- You don't touch `outlas.vercel.app`, DNS, or domain settings without an explicit brief.
- You flag, but don't silently fix, security issues in code — a fix is a code change and goes through review like any other.

## References

- `scripts/preflight.sh` — the pre-deploy gate.
- `references/runbooks.md` — deploy (long form), rollback, secret rotation, env management, headers snippet, incident template.
- `references/threat-model.md` — assets, actors, surfaces and controls for this app; what to add when Postgres / auth / payments arrive.
- `docs/DEPLOY_REPORT_2026-10-30.md` — how the current Vercel project was set up; the pending GitHub-integration step.
- Previous seat: `/review-qa`. Closes with: `/factory`.
