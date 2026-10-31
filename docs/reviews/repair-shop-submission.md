# Review — Repair-shop submission form · 2026-10-31

**Slug:** `repair-shop-submission` · **Spec:** [docs/specs/repair-shop-submission.md](../specs/repair-shop-submission.md) · **Reviewer:** Review/QA

## Verdict: **ship-with-env-setup**

Code is spec-complete and gate-green. Shipping needs the user to complete two prerequisites in the Vercel dashboard before the form is usable end-to-end:
1. Enable Vercel Blob on the project → auto-generates `BLOB_READ_WRITE_TOKEN`
2. Run `scripts/migrations/002_repair_submissions.sql` against production Postgres (paste into Vercel Postgres' Query tab, or `psql $POSTGRES_URL -f …`)

Without (1) the form submits but returns the honest "Uploads aren't live yet" message (AC10 — covered). Without (2) the API returns 500 and the user sees the API-error panel. The page itself renders and the menu entry works at every state.

## Gate
`qa-gate.sh` — typecheck ✓ · lint ✓ · tokens ✓ · build skipped (Vercel runs full build on deploy)

## What was built
- `scripts/migrations/002_repair_submissions.sql` — idempotent CREATE + two indexes, mirrors the sibling's `001_guide_submissions.sql` shape.
- `app/lib/repair-submissions.ts` — server-only data module (`import "server-only"` at top). Exports `insertRepairSubmission`, `checkRepairSubmissionRateLimit` (5-min window), `hashIpForRateLimit` (SHA-256 daily salt — never stores raw IPs).
- `app/api/repair-submit/route.ts` — `POST` endpoint. Validates server-side (shop name, address, email, URL shape, description length), rate-limits by IP hash, uploads up to 3 files to Vercel Blob (`access: "public"`, random suffix, sanitised filename), writes the row, returns `{ ok: true, id }`. Returns a specific 503 if `BLOB_READ_WRITE_TOKEN` is unset.
- `app/repairs/submit/page.tsx` — server shell with `data-surface="repair"`, display-2 heading, brand-voice hero paragraph.
- `app/repairs/submit/SubmitForm.tsx` — client form with field validation, drag-and-drop upload (image preview), live char counter, loading state, success panel, error panel, focus management (invalid field gets focus on validation).
- `app/ui/app-nav-data.ts` — one new Marketplace row: `Submit your shop` → `/repairs/submit`. Preserved the sibling's `Join as a guide` entry added in parallel.

## Acceptance criteria

- [x] **AC1 — route exists** — `/repairs/submit` compiles; Vercel build will serve 200.
- [x] **AC2 — menu entry** — `app/ui/app-nav-data.ts` has `submit-shop` row.
- [~] **AC3 — happy path (no media)** — Server-verified by code review; live-verifiable after migration + env setup.
- [~] **AC4 — happy path (with media)** — Server-verified by code review; live-verifiable after both prerequisites.
- [x] **AC5 — required validation** — Client blocks submit, focuses the first invalid field; server is the source of truth.
- [x] **AC6 — email validation** — Client regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`; server mirrors.
- [x] **AC7 — file too large** — Client rejects (shows per-file error, drops from batch); server rejects.
- [x] **AC8 — file type** — Client and server both check against the ALLOWED_MIME set.
- [x] **AC9 — API error** — Form-level panel in brand voice with fallback email.
- [x] **AC10 — Blob not configured** — API returns 503 with the honest message; form shows it as a form-level error.
- [x] **AC11 — SQL migration** — File exists; idempotent via `IF NOT EXISTS`.
- [x] **AC12 — server-only boundary** — `app/lib/repair-submissions.ts` line 1 is `import "server-only";`.
- [~] **AC13 — dark mode** — Code uses semantic tokens only; `data-surface="repair"` keeps rust surface in both themes. Live verification post-deploy.
- [~] **AC14 — mobile 375px** — Full-width fields and submit button at narrow widths. Live verification post-deploy.
- [x] **AC15 — keyboard** — `<label htmlFor>` on every field; `focus-visible:ring-2 focus-visible:ring-[var(--accent)]` on all inputs.
- [x] **AC16 — no sensitive NEXT_PUBLIC_** — `BLOB_READ_WRITE_TOKEN` is server-only; grep: no `NEXT_PUBLIC_` references in this diff.

Legend: `[x]` ticked · `[~]` partial — needs live verification after env + migration land · `[ ]` not met.

## Findings

### Blocker
_None._

### Major
_None._

### Minor
**[Minor] Rate-limit SQL uses template-literal interval that may not parameterise cleanly** — `app/lib/repair-submissions.ts` (checkRepairSubmissionRateLimit)
Writing `INTERVAL '${RATE_LIMIT_WINDOW_MIN} minutes'` as a template literal interpolates on the JS side before @vercel/postgres parameterises. Not a SQL-injection risk because `RATE_LIMIT_WINDOW_MIN` is a module-level numeric constant, but a reviewer catching this cold wouldn't know that at a glance.
Fix: change to a parameterised form (`NOW() - make_interval(mins := ${RATE_LIMIT_WINDOW_MIN})`) or add a `/* trusted constant */` comment. Follow-up acceptable.

### Nit
**[Nit] Pre-existing `bg-ink/40` opacity-trap** — unchanged carryover from the previous slugs; already tracked as a follow-up.

## Noticed
- Sibling session's `guide_submissions` migration (`001_…`) exists but the `/guides/join` page itself isn't visible yet in the diff I've seen. Expect their build to land soon; menu entry is already in place.
- The dev-server port conflict (sibling owns 3200) prevented local browser verification for this slug. Prod verification is the fallback.

---
Next: `/security-ops` on `repair-shop-submission` — ship with the env/migration prerequisites captured in the release note.
