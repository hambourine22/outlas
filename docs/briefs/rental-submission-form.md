# Rental-store submission form

**Slug:** `rental-submission-form` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** L

## Problem
Right now a rental shop can't put itself on the Oütlas map — the dataset is entirely hand-curated. For the map to scale beyond the 33 named shops that landed in [`rentals-near-resorts`](rentals-near-resorts.md), shops need a way to submit themselves with the small amount of information that's actually useful: who they are, how to reach them, and the photo or short video that represents them.

## Why now
The world-resorts + rentals pair just shipped (2026-10-31). The map now covers every major ski region with ~34 shops across 10 countries, but adding the long tail through curation is slow and brittle. A simple, well-designed submission form is the honest next step — it lets provider growth happen without Hamish typing in records one at a time, and it matches the brand voice ("Share gear. Buy less. Ride more." — the shops are the gear-sharers Oütlas is built to connect).

## Success signal
A rental shop owner lands on `/rentals/submit` (or similar), fills in six-ish fields, uploads a photo or short video, hits submit, and sees a brand-voice "we've got it" screen. On Hamish's side, the submission lands somewhere he can review and promote onto the live map with one click (not a code edit).

## In scope
- New route `/rentals/submit` with a form carrying: **shop name · resort(s) served · one-line description · social-media handle · website (optional) · photo or short video upload (optional, one asset max for v1)**.
- Submission writes to a store Hamish can review (see **Data boundary** below — your call).
- Upload target for the media asset (see **Data boundary** below).
- Success state in-page + email notification to Hamish (so he doesn't have to poll).
- New entry in the TopBar hamburger drawer — grouped under a new "Join" group or "Marketplace" group (your call; see Open questions).
- Form uses the existing design system (hairline rules, `.label`, Vollkorn display, Archivo UI). No new primitives in v1 beyond the form controls themselves.
- Basic anti-abuse: honeypot field + per-IP rate limit (one submission per 10 minutes).
- All six states for every form field (default, filled, invalid, submitting, submitted, error).

## Out of scope
- Admin UI for Hamish to approve / reject in-browser (v1 approves by hand in whichever store ends up holding the submissions).
- Automatic placement on the live map (always goes through Hamish's review — the map must stay editorial).
- Multiple-asset uploads (v2).
- Payment, verification badges, or shop-side account creation (v2+).
- Form i18n (v1 is English only).

## Data boundary — needs decision before implementation
Three plausible shapes, each with real trade-offs. **Security/Ops decision owned by `/security-ops`; Hamish picks the direction.**

| Path | Storage | Uploads | Setup cost | Running cost | Moderation |
|---|---|---|---|---|---|
| **A — Formspree-style zero-backend** | Email to Hamish | Formspree handles files | Zero (Formspree account) | Formspree free tier covers v1 | Hamish forwards to himself; copies into `rentals.ts` by hand |
| **B — Airtable + Vercel Blob (Recommended)** | Airtable base (`rental_submissions` table — matches existing Airtable workflow in `S | Claude Export/` tooling) | Vercel Blob with the blob URL stored in the Airtable record | ~1 hour: Airtable base + 2 secrets (`AIRTABLE_TOKEN`, `BLOB_READ_WRITE_TOKEN`) in Vercel | Airtable pro tier ~$10/mo; Vercel Blob is pay-per-GB | Airtable's native views; one-click "approved" column that a scheduled sync pushes to `rentals.ts` later |
| **C — Vercel Postgres + Vercel Blob** | New `rental_submissions` table in `@vercel/postgres` | Vercel Blob | ~2 hours: schema + migration + both secrets | Postgres free tier is tight; Blob pay-per-GB | Custom admin page needed (or `psql` for v1) |

**Secrets each path introduces** (Vercel env vars):
- A — none
- B — `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY` (notification email)
- C — `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY` (Postgres URL already set)

## Seats
- [ ] `/security-ops` — **consulted first** for the data boundary (which path above, which secrets, which anti-abuse controls). Separately owns the deploy.
- [ ] `/ux` — runs. Form fields, copy, flow, all six states, moderation story.
- [ ] `/ui` — runs. Form component, success/error states, upload progress, menu wiring, specimen chapter.
- [ ] `/review-qa` — runs. Gate + browser matrix including the submit path, upload progress, error recovery.
- [ ] `/security-ops` — runs. Preflight + deploy, verify no secret in client bundle, confirm rate limiter and honeypot are active.

## Decisions (2026-10-31)

- **Path B** — Airtable + Vercel Blob. Form data to Airtable; media to Vercel Blob; blob URL stored in Airtable record.
- **Menu placement** — new "Join" group in the TopBar drawer, one row for v1: "List your rental shop".
- **Media policy** — photo or short video, 50 MB cap, MIME-restricted to `image/jpeg | image/png | image/webp | video/mp4 | video/quicktime`.

## Security/Ops consult (early — per L-sizing rule)

**Secrets introduced (production env in Vercel, never in files):**
- `AIRTABLE_TOKEN` — personal-access token with `data.records:write` on the submissions base only
- `AIRTABLE_BASE_ID` — the target base (`appXXXXXXXXXXXXXX`)
- `AIRTABLE_TABLE_NAME` — the target table (default: `rental_submissions`)
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob read-write token (auto-provisioned when a Blob store is created on the project)
- `RESEND_API_KEY` — notification email service (any provider works; Resend chosen for 1-call ergonomics and Vercel-adjacent)
- `OUTLAS_NOTIFY_EMAIL` — Hamish's inbox for new-submission alerts

None of these ever carries the `NEXT_PUBLIC_` prefix — they must stay server-side. The Blob public-read URL IS fine to store in Airtable (that's its purpose).

**Server/client boundary:**
- API route at `app/api/rentals/submit/route.ts` — accepts `POST multipart/form-data`, orchestrates the Blob upload + Airtable write + email, returns `{ ok: true, id }` on success.
- Any module touching the Airtable or Blob SDK carries `import "server-only"` at the top. A client component that references it would fail the build — the exact guard we want.
- Form itself is a client component (needs state, file selection) but only ever `fetch`-es the route; never imports the server modules.

**Anti-abuse (v1 — simple + honest):**
- Honeypot: a visually-hidden `<input name="website_url_2">` that bots fill; server rejects any submission with that field non-empty.
- Rate limit: in-memory LRU of submitter IPs with a 10-minute cool-down. Lossy on cold start (OK for v1 — not an auth-sensitive flow; the honeypot and Hamish's moderation stop malicious traffic from reaching the live map).
- File validation server-side: MIME sniff (not just the `Content-Type` header), extension match, byte-size check, filename sanitised to `<nanoid>.<ext>`.
- No CAPTCHA for v1 (adds friction; honeypot handles the trivial bots; serious abuse is a v2 problem).

**Preview mode (when secrets are not yet provisioned):**
- Server reads env vars at request time. If any required secret is missing, the route returns `202 Accepted` with `{ ok: true, preview: true, note: "Form is in preview mode — your submission wasn't stored. Secrets land soon." }` and logs the parsed submission to the server console. Lets Hamish demo the form end-to-end before provisioning Airtable/Blob/Resend accounts.

**Airtable schema** (Hamish provisions in the base — `/security-ops` will restate this in the deploy release note):
| Field                  | Type        | Notes |
|---|---|---|
| `name`                 | Single line | required |
| `resorts`              | Long text   | required · comma-separated resort names |
| `description`          | Long text   | required · one line |
| `social`               | URL         | optional |
| `website`              | URL         | optional |
| `media_url`            | URL         | Vercel Blob public URL (optional) |
| `media_mime`           | Single line | optional · MIME type of uploaded asset |
| `submitted_at`         | ISO date    | server-set |
| `ip_hash`              | Single line | SHA-256 of submitter IP + daily salt (not raw IP — rate-limit evidence without PII at rest) |
| `status`               | Single select | one of `pending` / `approved` / `rejected`; default `pending` |
| `approved_slug`        | Single line | set when approved; feeds future sync into `rentals.ts` |

## Links
- Current rentals: [`app/content/map/rentals.ts`](../../app/content/map/rentals.ts)
- Rentals release: [`docs/releases/2026-10-31-rentals-near-resorts.md`](../releases/2026-10-31-rentals-near-resorts.md)
- Airtable client (existing, Claude Export tooling): `/Users/hamishduncan/Documents/Oütlas.cc/S | Claude Export/20260525--outlas-airtablejson-files/airtable.ts`
- Design system (form controls don't exist yet in the system): [`docs/DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md), [`app/design-system/page.tsx`](../../app/design-system/page.tsx)
