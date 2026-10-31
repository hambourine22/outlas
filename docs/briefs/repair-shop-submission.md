# Repair-shop submission form

**Slug:** `repair-shop-submission` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** L

## Problem
Repair shops the world over can appear on the map, but there's no self-service path for a new shop to say "we exist, add us." Every pin so far was hand-curated. If Oütlas is going to grow beyond the 22 shops shipped in `repairs-near-resorts`, shops need a one-page submission form that respects their time and ends up in a draft queue, not immediately on the live map.

## Why now
The repair layer went live today with ~22 named shops. The obvious next question — "how does my shop get on this map?" — needs an honest answer in the UI before the first inbound email asking that very question arrives.

## Success signal
A repair-shop owner anywhere in the world can open the Oütlas site, find a `Submit your shop` entry in the hamburger menu, fill five fields and upload up to three photos, and submit. A row lands in the `repair_submissions` Postgres table with the media stored in Vercel Blob and ready for Hamish to review and promote.

## In scope
- **Page:** `/repairs/submit` under the Marketplace group of the hamburger menu, with Oütlas brand voice ("Share your shop with the mountain community").
- **Form fields** (minimal — 5):
  1. Shop name (required, text)
  2. Address or town (required, text — single line, no form-fill helper)
  3. Website (optional, URL)
  4. Social-media link (optional, URL)
  5. Short description (optional, textarea, max 200 chars)
  6. Email for follow-up (required, email) — not shown on map, used for moderation reply
  7. Up to 3 media files (optional, JPG/PNG/MP4/MOV, 10 MB each)
- **Storage:**
  - Media → Vercel Blob (one new env var: `BLOB_READ_WRITE_TOKEN`).
  - Submission text → new `repair_submissions` Postgres table (uses existing `POSTGRES_URL`).
- **API routes:** one `POST /api/repair-submit` route that validates, uploads files to Blob, writes the row.
- **Moderation:** manual. New rows land with `status = 'pending'`. Hamish reviews via a server-only script or direct Postgres read.
- **Menu entry:** added to Marketplace group in `app/ui/app-nav-data.ts`.
- **Success state:** inline success panel on the same page (no redirect) with brand-voice "Thanks — we'll be in touch" copy.

## Out of scope
- Public moderation UI (next slug).
- Auto-promotion of submissions to live `repairs.ts` records (manual for now).
- Captcha / anti-spam beyond basic validation (next slug if abuse appears).
- Submission forms for resorts / rentals / guides (same pattern, future slugs).
- OAuth / shop-owner accounts (future slug).
- Email notifications to Hamish on new submission (follow-up — easy add via Resend later).

## Seats
- [ ] `/security-ops` — **consulted at the START** per L-size rule for the data boundary:
  - New secret `BLOB_READ_WRITE_TOKEN` (publishable? No — server-only; never `NEXT_PUBLIC_`).
  - New data boundary: the API route must `import "server-only"` the DB helper and validate file size + MIME type before Blob upload.
  - Rate limiting is deferred to a follow-up brief; v1 ships without, acceptable risk given low expected volume.
- [ ] `/ux` — runs. Spec in `docs/specs/<slug>.md`.
- [ ] `/ui` — runs. Form page, API route, Postgres migration, Blob plumbing, menu entry.
- [ ] `/review-qa` — runs. Gate script + browser form-submit smoke.
- [ ] `/security-ops` — runs. Preflight, Blob + Postgres env setup, deploy.

## Links
- Previous slug (menu pattern): [`docs/MAP_MENU_ARCHITECTURE.md`](../MAP_MENU_ARCHITECTURE.md).
- Existing nav: [`app/ui/app-nav-data.ts`](../../app/ui/app-nav-data.ts).
- Vercel Blob docs: `https://vercel.com/docs/vercel-blob`.
- `@vercel/postgres` already in use: [`app/lib/data.ts`](../../app/lib/data.ts).
