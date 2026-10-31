# Runbooks

Step-by-step procedures for the Security/Ops seat. Each one is written to be followed under mild pressure — short steps, the command on its own line, what "good" looks like after each.

Contents: [Deploy](#deploy) · [Rollback](#rollback) · [Env vars](#env-vars) · [Secret rotation](#secret-rotation) · [Security headers](#security-headers) · [Incident write-up](#incident-write-up) · [Connect GitHub auto-deploy](#connect-github-auto-deploy)

---

## Deploy

Project: `outlas-ds` · Team: `hamishs-projects-e7b0c0a0` · Linked by `.vercel/project.json` (gitignored; `vercel link` recreates it if missing).

1. Confirm the review verdict is `ship` and fixes are in.
   ```bash
   git status --short && git log -1 --format='%h %s'
   ```
   Good: no output from status; the SHA is the one in `docs/reviews/<slug>.md`.

2. Preflight.
   ```bash
   bash .claude/skills/security-ops/scripts/preflight.sh
   ```
   Good: `Preflight green` (warnings allowed — note them).

3. Env present in Vercel for any new variable (names only here).
   ```bash
   vercel env ls
   ```
   Good: every `process.env.X` the change introduced appears for `Production` (and `Preview` if previews need it).

4. Deploy — **from a clean worktree of the exact commit, never from the shared working tree.** `vercel` uploads whatever is on disk, and in this folder that includes other sessions' uncommitted files (a half-built API route shipped that way would be a real incident).
   ```bash
   SHA=$(git rev-parse --short HEAD) && W=/tmp/outlas-release-$SHA && git worktree add --detach "$W" "$SHA" && mkdir -p "$W/.vercel" && cp .vercel/project.json "$W/.vercel/" && ln -s "$PWD/node_modules" "$W/node_modules" && (cd "$W" && pnpm build && vercel --prod --yes); git worktree remove --force "$W"
   ```
   The `pnpm build` inside the worktree is the full production build that the local gate skips while a dev server holds `.next/` — it runs in isolation here, and it is the step that caught a React-19-only hook (`useActionState`) in a client component that tsc and lint had both passed. If it fails, nothing has been uploaded; fix forward, commit, repeat.
   Good: ends with `Aliased: https://outlas-ds.vercel.app`. Copy the `Production:` URL (`https://outlas-<hash>-….vercel.app`) into the release note; `vercel ls outlas-ds --prod` shows the previous one — your rollback target.

5. Verify every touched route.
   ```bash
   for r in / /design-system; do printf '%s → ' "$r"; curl -s -o /dev/null -w '%{http_code}\n' "https://outlas-ds.vercel.app$r"; done
   ```
   Good: `200` on each. Then open the live URL in the browser: light, dark, system; 375px; the change itself; console clean.

6. Server-side errors (if the change touched server code or data).
   Vercel MCP: `get_runtime_errors` / `get_runtime_logs` for the project, or `vercel logs https://outlas-ds.vercel.app --since 10m`.
   Good: nothing new.

7. Release note → `docs/releases/<YYYY-MM-DD>-<slug>.md` (template in `.claude/skills/factory/references/templates.md`). Commit it.
   ```bash
   git add docs/releases && git commit -m "Release: <slug>"
   ```

8. Hand back to `/factory` to close the slug.

---

## Rollback

Decide within ten minutes of a bad live check. Roll back first, debug second.

**Alias rollback (seconds, no rebuild):**
```bash
vercel rollback
```
Interactive — it offers the previous production deployment. Or target one:
```bash
vercel ls outlas-ds
vercel rollback https://outlas-ds-<hash>-hamishs-projects-e7b0c0a0.vercel.app
```
Good: `curl -sI https://outlas-ds.vercel.app/design-system` → 200 and the old behaviour is back.

**Promote a specific build:**
```bash
vercel promote https://outlas-ds-<hash>-hamishs-projects-e7b0c0a0.vercel.app
```

**Code-level revert (once stable):**
```bash
git revert <sha> --no-edit
vercel --prod --yes
```
Prefer this afterwards so `main` matches production again.

Record it under `## Incident` in the release note: what broke, when you noticed, what you did, when it was back.

---

## Env vars

Names here, values never. Values go through the CLI prompt or the Vercel dashboard.

| Task | Command |
|---|---|
| List | `vercel env ls` |
| Add to production | `vercel env add NAME production` (prompts for the value) |
| Add to preview too | `vercel env add NAME preview` |
| Remove | `vercel env rm NAME production` |
| Sync local | `vercel env pull .env.local` (gitignored; never commit) |

After adding or changing a `NEXT_PUBLIC_*` variable, **redeploy** — it's inlined at build time, so the running deployment keeps the old value until a new build.

Current inventory (names): `NEXT_PUBLIC_MAPBOX_TOKEN` (public `pk.` token, URL-restricted in the Mapbox dashboard). `POSTGRES_URL` and friends arrive when Vercel Postgres is attached — Vercel injects them automatically; they are *not* `NEXT_PUBLIC_`.

---

## Secret rotation

Trigger: a value appeared anywhere it shouldn't — a commit (even if later removed), a screenshot, a chat paste, a log line, a public preview URL.

1. **Issue the new value at the provider first**, so there's no gap.
   - Mapbox: Account → Tokens → create a new public token with the same scopes; set URL restrictions to `https://outlas-ds.vercel.app/*`, `https://*.vercel.app/*`, `http://localhost:3200/*`.
   - Vercel Postgres: Storage → the database → Settings → reset credentials (Vercel re-injects `POSTGRES_*`).
2. **Update Vercel env**: `vercel env rm NAME production` then `vercel env add NAME production`. Same for preview.
3. **Redeploy**: `vercel --prod --yes`. Verify live.
4. **Update local**: `vercel env pull .env.local`.
5. **Revoke the old value** at the provider. Only now — the live site is already on the new one.
6. **If it was in git history**: the commit is public forever; revoking is what protects you, not rewriting history. Only rewrite history if the repo is private *and* the team agrees; otherwise leave it and note it in the incident write-up.
7. Write it up (template below) and add a learning.

---

## Security headers

Baseline — low risk, add as its own XS brief:

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
export default nextConfig;
```

If the map later needs the user's location, change `geolocation=()` to `geolocation=(self)`.

**CSP** — ship report-only first, enforce after a quiet day. Mapbox GL needs workers, blob URLs and its API/event hosts; the theme bootstrap is an inline script (hash it — the string is static — or move to a nonce):

```js
{ key: "Content-Security-Policy-Report-Only", value: [
  "default-src 'self'",
  "script-src 'self' 'sha256-<hash of THEME_BOOTSTRAP>'",
  "style-src 'self' 'unsafe-inline'",            // Tailwind/next inject style tags; tighten later
  "img-src 'self' data: blob: https://*.mapbox.com",
  "font-src 'self'",
  "connect-src 'self' https://api.mapbox.com https://events.mapbox.com",
  "worker-src 'self' blob:",
  "child-src blob:",
  "frame-ancestors 'none'",
].join("; ") }
```

Compute the script hash with: `node -e "const c=require('crypto');const s=process.argv[1];console.log('sha256-'+c.createHash('sha256').update(s).digest('base64'))" "$(sed -n '/const THEME_BOOTSTRAP = `/,/`;/p' app/layout.tsx | sed '1d;$d')"` — then verify in the browser console that nothing is reported before switching the header name to `Content-Security-Policy`.

---

## Incident write-up

`docs/releases/<YYYY-MM-DD>-incident-<slug>.md`

```markdown
# Incident — <one-line title> · <YYYY-MM-DD>

**Detected:** <time, by whom/what> · **Resolved:** <time> · **Duration:** <m> · **Impact:** <routes / users / themes affected>

## Timeline
- <HH:MM> — <what was observed>
- <HH:MM> — <action taken>
- <HH:MM> — <confirmed resolved — how>

## Cause
<One paragraph. The mechanism, not the person.>

## What we did
<Rollback / revert / rotate / config — with the commands or deployment ids.>

## What changes
- <a check that moves earlier, a script that gains a rule, a skill that gets a line>

## Trail
<related brief / spec / review / release>
```

Add one line to `docs/learnings.md`.

---

## Connect GitHub auto-deploy

Currently production deploys are the manual `vercel --prod` step. To make every push to `main` deploy automatically (and every branch get a preview URL), a human with the GitHub account must grant Vercel access once:

1. https://github.com/apps/vercel/installations/new → choose `hambourine22` → grant `outlas`.
2. Vercel dashboard → `outlas-ds` → Settings → Git → Connect `hambourine22/outlas`, production branch `main`.
3. After connecting, the deploy runbook's step 4 becomes `git push`; steps 5–8 are unchanged. Keep `vercel --prod --yes` as the manual fallback.

Until this is done, treat the CLI step as the release and never leave it half-done — a pushed commit that isn't deployed is a trap for the next person who assumes `main` is live.
