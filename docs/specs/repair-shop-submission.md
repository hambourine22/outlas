# Repair-shop submission form — spec

**Slug:** `repair-shop-submission` · **Brief:** `docs/briefs/repair-shop-submission.md` · **UX:** Hamish · **Date:** 2026-10-31 · **Status:** ready-for-ui

## 1. Problem & success signal
Repair shops have no self-service path onto the Oütlas map. A one-page form at `/repairs/submit` lets a shop owner submit their basics and up to three photos in under three minutes; the row lands in a pending-review Postgres table with media in Vercel Blob.

## 2. Users & context
- **Who:** repair-shop owner — small-business operator, often one person, often on a phone between customers.
- **Device & moment:** phone first (desk breaks between repairs; evenings at home), desktop second.
- **UX moment:** `data-surface="repair"` — rust panel for the form container so the submission feels like it belongs to the repair taxonomy.
- **Entry points:** hamburger menu → Marketplace → `Submit your shop`. Also deep-linkable (`/repairs/submit`).

## 3. Flow

### Primary path
1. Owner opens hamburger → taps "Submit your shop". Lands on `/repairs/submit`.
2. Reads a one-sentence hello in brand voice. Sees five fields and a drag-or-click upload zone.
3. Fills shop name + address + email (required). Optionally fills website, social, description. Optionally drops in up to 3 photos.
4. Taps "Share with Oütlas". Button goes to loading state.
5. Success panel replaces the form inline — "Thanks — we'll be in touch at <email>." No redirect, no refresh.

### Branches & states
- **Empty:** first paint — placeholders show real text ("`+44 7700 900900`"-style on phone? No — just field labels and short helpers).
- **Loading:** submit button becomes `Sharing…` + disabled while the API call runs.
- **Validation error** (inline, below the field): required field blank, invalid email, file too big (>10MB), unsupported MIME. Red is reserved — use `--rule-strong` border + brand-voice copy ("That doesn't look like an email. Try again.").
- **API error:** panel at top of form in brand voice: "Something broke. Try again, or email us direct at hamish@hamishduncan.com." No stack trace.
- **No token / Blob disabled:** API returns a specific error — form shows "Uploads aren't live yet. Please email <hamish@…> instead."
- **Returning user:** no persistence — form is empty each visit (resists bots that pre-fill).
- **Narrow (≤ 640):** fields stack full-width; upload zone is 100% wide; submit button spans full width at the bottom.

## 4. Content (voice: short declaratives, no exclamation, no "Oops")

| Where | Copy | Notes |
|---|---|---|
| Page title | `Submit your shop` | Browser tab + h1 |
| Hero paragraph | `Oütlas is built from the ground up by shops like yours. Share your basics and we'll add you to the map.` | One sentence |
| Field: Shop name | `Shop name` · required | `label` style |
| Field: Address or town | `Address or town` · required | Single line |
| Field: Website | `Website` · optional | URL input |
| Field: Social | `Social media link` · optional | URL input |
| Field: Description | `Tell us about your shop` · optional · 200 chars | textarea with char count |
| Field: Email | `Email for follow-up` · required · `We'll only use this to confirm your listing.` | small helper under field |
| Upload zone | `Drop photos or video (up to 3)` + `JPG · PNG · MP4 · MOV · 10MB each` | small helper |
| Submit button | `Share with Oütlas` | verb-first |
| Loading | `Sharing…` | button text |
| Success heading | `Thanks.` | display-2 Vollkorn |
| Success body | `We'll be in touch at <email> once we've had a look. Usually within a week.` | one line |
| Success CTA | `Back to the map →` | links to `/` |
| Validation: required empty | `This one is needed.` | under field |
| Validation: bad email | `That doesn't look like an email.` | under field |
| Validation: file too big | `That file's over 10MB. Try a smaller one.` | under file name |
| Validation: wrong file type | `Only JPG, PNG, MP4 or MOV.` | under file name |
| API error top-of-form | `Something broke. Try again, or email us direct at hamish@hamishduncan.com.` | hairline-bordered panel |

## 5. Structure
- **Reuses:** `label`, `font-ui`, `chip`, hairline rules, `data-surface="repair"` for the form container (so it reads as rust/repair context).
- **New primitives:** `<SubmitForm>` client component holding the form state. `<UploadZone>` client subcomponent for the file-input + drag-drop + preview tiles. `<SuccessPanel>` static for the success state. All inside `app/repairs/submit/`.
- **Specimen in `/design-system`:** no new chapter — form is a one-off page, not a reusable component. The surface + input treatments reuse existing tokens.
- **Content source:** no `app/content/*` facade — form writes directly to Postgres through a server-only data module `app/lib/repair-submissions.ts` which, like `app/lib/data.ts`, carries `import "server-only"`.
- **Database:** new `repair_submissions` table (SQL in `scripts/sql/001_repair_submissions.sql`, applied manually via Vercel's SQL console; migration frameworks are out of scope for v1). Shape:
  ```sql
  CREATE TABLE repair_submissions (
    id TEXT PRIMARY KEY,                 -- cuid-like, generated server-side
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    shop_name TEXT NOT NULL,
    address TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT,
    social_url TEXT,
    description TEXT,
    media_urls JSONB NOT NULL DEFAULT '[]'::jsonb
  );
  ```
- **Blob paths:** `repair-submissions/<id>/<original-filename>`. ID is in the folder so related media groups together and so a reject/delete is a prefix delete.
- **API route:** `POST /api/repair-submit` — accepts `multipart/form-data`, validates, uploads to Blob, writes the row.
- **Menu entry:** Marketplace group in `app/ui/app-nav-data.ts` gains one row: `{ n: "+", slug: "submit-shop", title: "Submit your shop", group: "marketplace", href: "/repairs/submit" }`.

## 6. Accessibility requirements
- **Keyboard path:** Tab reaches each field in visual order; `Enter` on the submit button posts; `Escape` is a no-op (no modal to close).
- **Names:** every field has an `<label htmlFor>`; the upload zone announces as `Media uploads, button, 0 of 3 selected`.
- **Text classes:** labels are `.label` (large text per the system); helper text under fields is small — contrast must hit 4.5:1 on the rust canvas (`--ink` is snow on rust surface, so helpers at `--ink-muted` at 60% snow still pass).
- **Error announcements:** errors live in `aria-live="polite"` regions tied to each field via `aria-describedby`.
- **Motion:** button loading-dots respect `prefers-reduced-motion`; success panel appears without transition under reduced motion.
- **Targets:** all buttons ≥ 44×44; drag-drop zone ≥ 120×44.

## 7. Acceptance criteria

- [ ] **AC1 — route exists** — `GET /repairs/submit` returns 200 with the form rendered.
- [ ] **AC2 — menu entry** — Hamburger → Marketplace → `Submit your shop` → navigates to `/repairs/submit`.
- [ ] **AC3 — happy path** — Given valid shop name, address, email and no media, when the user taps `Share with Oütlas`, then the API returns 200, the success panel replaces the form, and a row with `status='pending'` appears in `repair_submissions`.
- [ ] **AC4 — happy path with media** — Given the above plus 1 JPG under 10MB, when the user submits, then the row's `media_urls` is a one-element JSON array of the Vercel Blob public URL; the file is served at that URL.
- [ ] **AC5 — required validation** — Given an empty required field, when the user submits, then the API call is NOT made, each empty required field shows its inline error, and the first invalid field gets focus.
- [ ] **AC6 — email validation** — Given `email = "nope"`, when the user submits, then the inline helper reads `That doesn't look like an email.` and submission is blocked client-side.
- [ ] **AC7 — file too large** — Given a 15MB JPG, when the user picks it, then the upload tile shows `That file's over 10MB. Try a smaller one.` and the submit button stays enabled but drops that file from the batch.
- [ ] **AC8 — file type** — Given a .pdf, when the user picks it, then the tile shows `Only JPG, PNG, MP4 or MOV.` and the file is dropped.
- [ ] **AC9 — API error** — Given the API returns 500, when the user submits, then a hairline-bordered error panel appears at the top of the form in brand voice with the fallback email, and the form data is preserved.
- [ ] **AC10 — Blob not configured** — Given `BLOB_READ_WRITE_TOKEN` is unset in the environment, when the user submits a file, then the API returns a specific error and the form shows the "Uploads aren't live yet" message.
- [ ] **AC11 — SQL migration** — The file `scripts/sql/001_repair_submissions.sql` exists; running it against an empty Postgres instance creates the `repair_submissions` table and a row inserts cleanly.
- [ ] **AC12 — server-only boundary** — `app/lib/repair-submissions.ts` imports `server-only`; a client-side import triggers a Next.js build error (verified by `grep` on `.next/` or by `tsc` + Next's own check).
- [ ] **AC13 — dark mode** — The form page renders cleanly in Light / Dark / System modes. The repair surface stays rust in both themes (surfaces are theme-independent per the system contract).
- [ ] **AC14 — mobile (375px)** — No horizontal scroll; fields stack full-width; upload zone is full-width; submit button is full-width.
- [ ] **AC15 — keyboard** — Tab reaches every field in order; submit works on Enter from the last field; focus-visible ring is on-brand (`--accent`).
- [ ] **AC16 — no sensitive NEXT_PUBLIC_** — The only env var added is `BLOB_READ_WRITE_TOKEN` (server-only, no `NEXT_PUBLIC_` prefix).

## 8. Assumptions & open questions

| # | Assumption | Confidence | If wrong |
|---|---|---|---|
| A1 | 3 media files × 10MB is enough breathing room for a shop's intro | High | Lift the per-file cap in a one-line change |
| A2 | Postgres `TIMESTAMPTZ DEFAULT NOW()` is the right created_at — no need for app-side override | High | Pass explicit server time |
| A3 | Manual moderation (read the table, update status) is enough for v1 — no admin UI | Medium | Build a `/admin/submissions` route in v2; still needs auth which doesn't exist yet |
| A4 | No rate limiting in v1 — abuse volume is low until the form has a URL in the wild | Medium | Vercel's built-in DDoS protection + a per-IP throttle in a v2 follow-up |
| A5 | Blob public URLs are acceptable (anyone with the link sees the image) — moderators share links to Hamish | High | Switch to Blob signed URLs; adds API complexity |
| A6 | The form validates on client AND server — both are needed; server-side validation is the source of truth | High | — |

**Counter-evidence:** every "accept-user-content" form in the wild eventually gets spam. The spec ships without captcha or rate-limiting; the counter is that volume will be small for weeks and we'll see the shape of the abuse before deciding what mitigation fits. If spam shows up before Monday, the follow-up is a one-shot Cloudflare Turnstile integration (~30 min work).

**Open questions (≤ 3):**
1. Email notification to Hamish on each submission — in scope for v1 or follow-up? *Assumption: follow-up (Resend wiring is a separate concern; the Postgres row IS the signal and I can poll).*
2. Should "social media link" accept multiple URLs? *Assumption: single URL in v1; shops with multiple socials pick their primary — matches the brand's hairline economy.*
3. Should the form offer to prefill shop data from Google Maps or similar? *Assumption: no — adds integration cost and privacy surface for a form that's over in 2 minutes anyway.*

## 9. Appendix
- **Options considered:**
  - *Airtable:* visual to moderate, but ties us to a vendor and adds an API key the user doesn't have yet in Vercel. Rejected per user decision.
  - *Email-only via Resend:* zero DB, but loses the batchable queue. Rejected per user decision.
  - *Chosen — Vercel Blob + Postgres draft table:* native, two env vars tops, moderation is a Postgres read.

---
Next: `/ui` on `repair-shop-submission`. UI decides: exact chip/input radii (max 6px), drag-drop zone border treatment, loading-dot animation, SQL file placement.
