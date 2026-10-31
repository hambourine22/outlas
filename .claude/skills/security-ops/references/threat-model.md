# Threat model — Oütlas (design system + map shell)

A lightweight model for a small public Next.js site. Revisit it when any of the "what changes the model" items lands.

## What we're protecting

| Asset | Where | Why it matters |
|---|---|---|
| Mapbox public token | `NEXT_PUBLIC_MAPBOX_TOKEN` (Vercel env, `.env.local`) | Abuse burns quota and money. Protection is URL restriction at Mapbox, not secrecy — it is in the client bundle by design. |
| Postgres credentials | `POSTGRES_*` (Vercel-injected, server only) | Read/write to resort, rental, repair data. Must never reach the client bundle or git. |
| Vercel project / team access | Vercel account, CLI auth | Whoever can deploy can replace the site. |
| GitHub repo write access | `hambourine22/outlas` | Same, via the (future) auto-deploy. |
| Brand assets and content | `public/brand`, `app/content` | Not secret, but integrity matters — a defaced site is a brand incident. |
| Visitor trust | The live site | No auth or PII yet; the risk is serving malicious script or a hijacked map, not data loss. |

## Who might act against it

- **Opportunistic scanners** — look for leaked keys in public repos and bundles; hit any `/api` route they find. Automated; constant.
- **Quota abusers** — scrape a public Mapbox token and use it elsewhere. Mitigated by URL restriction.
- **Supply chain** — a compromised npm package. Mitigated by a small dependency surface, lockfile, `pnpm audit` in preflight.
- **Us** — the most likely source of an incident: a secret in a commit, a server module imported client-side, a deploy nobody verified. Mitigated by the factory gates.

## Attack surface today

| Surface | Exposure | Control |
|---|---|---|
| Static pages (`/`, `/design-system`, `/stories/*`, section pages) | Public, no input | Headers baseline (pending XS brief); no inline script except the hashed theme bootstrap |
| Mapbox GL in the browser | Loads tiles with the public token | URL-restricted token; `connect-src` in CSP when enforced |
| `app/lib/data.ts` → Vercel Postgres | Server only, no user input, static queries | Add `import "server-only"`; facades in `app/content` are the only callers; parameterise the moment input arrives |
| `localStorage` (`outlas:theme`) | Client only, one enum | Read inside try/catch; value validated (`light`/`dark` only) before use — already true in the bootstrap |
| `dangerouslySetInnerHTML` | One static string in `app/layout.tsx` | Sanctioned; any new use needs review sign-off |
| Dependencies | Next, React, Tailwind, mapbox-gl, @vercel/postgres | Lockfile committed; `pnpm audit --prod` high+ fails preflight |
| Deploy path | Manual `vercel --prod` from a laptop | Preflight + review verdict required; auto-deploy via GitHub pending (see runbooks) |

No authentication, no forms, no user-generated content, no payments, no cookies beyond Vercel's. That is why the model is small — keep it honest by updating this file when any of those arrive.

## Controls in place (and which gate owns them)

| Control | Gate |
|---|---|
| `.env*` gitignored and untracked | `preflight.sh` §1 |
| Secret-pattern scan over tracked files | `preflight.sh` §2 |
| `NEXT_PUBLIC_` inventory with sensitive-name check | `preflight.sh` §3 |
| `dangerouslySetInnerHTML` allow-list | `preflight.sh` §4, review checklist §6 |
| Interpolated SQL detection | `preflight.sh` §5, review checklist §6 |
| Build artefacts untracked | `preflight.sh` §6 |
| Dependency audit | `preflight.sh` §7 |
| Headers present | `preflight.sh` §8 (warning until the XS brief lands) |
| Typecheck / lint / build | `qa-gate.sh` |
| Live verification + rollback path | Deploy runbook |

## What changes the model

Add a section to this file and run `/security-ops` at the *start* of the brief when any of these appear:

- **Vercel Postgres attached** — credentials in env; `server-only` becomes mandatory, not a warning; queries with input must be parameterised; consider read-only DB role for the public site.
- **Forms or any user input** (contact, provider sign-up, search) — validation on the server, rate limiting (Vercel WAF / firewall rules), spam controls; CSRF if cookies appear.
- **Authentication** (provider dashboards) — session handling, password/OAuth provider choice, secure cookies, auth middleware; this is an L brief on its own.
- **File uploads** (provider photos) — storage (Vercel Blob), type/size validation, no execution from upload paths.
- **Payments** — never store card data; use a hosted provider (Stripe Checkout); PCI scope stays with them.
- **Third-party scripts** (analytics, embeds) — each one is a CSP exception and a supply-chain trust decision; prefer first-party or none.
- **Custom domain** (`outlas.cc`) — DNS ownership, HTTPS (Vercel handles certs), HSTS once stable.
- **Repointing `outlas.vercel.app`** to this repo — production cut-over plan, rollback to the old project, comms.

## Out of scope (for now, deliberately)

- DDoS beyond what Vercel absorbs by default.
- Physical/device security of contributors' laptops (standard org hygiene, not this repo's job).
- Formal pen test — revisit when auth or payments exist.
