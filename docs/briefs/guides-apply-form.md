# Guides apply form

**Slug:** `guides-apply-form` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** L

## Problem
Any guide who wants to appear on the Oütlas map has no way in. The guide pins on the map are a closed, hand-curated list — no form, no email, no self-serve. We're asking riders to trust Oütlas as a connector while giving guides no door to walk through.

## Why now
The guide layer just went from 4 Scottish individuals to 22 named bureaus globally (`guides-near-resorts` slug, 2026-10-31). The next bottleneck is intake — a route from "guide finds Oütlas on Instagram" to "guide appears on the map" with the user doing the review in between.

## Success signal
A mountain guide anywhere in the world can open `/guides/join`, submit their name, contact, a short pitch and a photo or two, and know the submission landed. Hamish gets a notification and can review and promote them onto the map through an existing admin flow (or a Postgres read for v1).

## In scope
- New page [`app/guides/join/page.tsx`](../../app/guides/join/page.tsx) with a brand-voice intro + a form.
- Form fields (first draft — UX will refine in the spec):
  - **Required:** Name, email, short pitch (3 sentences / 400 chars), disciplines (multi-select from the `ACTIVITIES` enum: ski / snowboard / splitboard / hike / trail-run / bike / climb / kayak / wild-swim / sail)
  - **Optional:** Regions you guide in, website URL, Instagram handle, YouTube URL, up to 3 media files (images or video, 25MB each)
- Submission destination: Postgres `guide_submissions` table (reuses existing `@vercel/postgres` wire; no new secret) **OR** Airtable (needs API key) — decided before UX spec, see below.
- Media uploads: Vercel Blob (`@vercel/blob` package, needs `BLOB_READ_WRITE_TOKEN` env var) **OR** base64 in DB (no new env, limited size) — decided before UX spec.
- Notification: email to Hamish on each submission (needs Resend / Postmark / similar), **OR** no notification v1 (Hamish polls the DB). Decided before UX spec.
- Hamburger menu entry: new chapter in `app/ui/app-nav-data.ts` under the Marketplace group → "Join as a guide".
- Anti-spam: a hidden honeypot field + 1 submission per IP per 5 min rate limit. No CAPTCHA v1 (needs third-party key).
- Success state: brand-voice "Thanks — we'll come back to you" page.

## Out of scope
- Admin review UI (Hamish reviews via DB tool / Postgres console).
- Auto-promote to the live `GUIDES` array (manual, through the existing content layer).
- Payment / booking integration.
- Any change to the existing map, sidebar, preview panel.

## Seats
- [x] `/security-ops` — **consulted at intake** (L-size rule). Decides data boundary. See decisions below.
- [ ] `/ux` — runs. Full spec: form flow, states (empty / filling / submitting / success / error / spam-rejected), copy, keyboard path, accessibility (file input, label associations, error messages), mobile layout.
- [ ] `/ui` — runs. New page + hamburger entry + form components + server action.
- [ ] `/review-qa` — runs. Gate + a happy-path submission + at least one error state.
- [ ] `/security-ops` — runs. Preflight, env vars set in Vercel, deploy, live submission test.

## Decisions I need from you before UX writes the spec

Pick one for each — these drive the brief's data boundary and the env var surface. See the AskUserQuestion I'm about to send; this document is updated once you answer.

1. **Submission destination** → Postgres (reuses existing wire) · Airtable (new API key) · email-only (no DB)
2. **Media uploads** → Vercel Blob (new env var) · base64 in DB (no env) · no uploads v1 (links to Instagram/YouTube only)
3. **Notification** → email to Hamish on each submission (needs Resend/Postmark key) · none v1 · Slack/Discord webhook

## Links
- Current nav structure: [`app/ui/app-nav-data.ts`](../../app/ui/app-nav-data.ts)
- Guides data layer: [`app/content/map/guides.ts`](../../app/content/map/guides.ts)
- Related architecture: [`docs/MAP_MENU_ARCHITECTURE.md`](../MAP_MENU_ARCHITECTURE.md)
- Data wire: [`app/lib/data.ts`](../../app/lib/data.ts) (`@vercel/postgres`)
