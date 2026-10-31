# Review — Guides apply form · 2026-10-31

**Slug:** `guides-apply-form` · **Brief:** [`docs/briefs/guides-apply-form.md`](../briefs/guides-apply-form.md) · **Spec:** _skipped_ (brief carries the full field list and decisions; L change wiring the user's three explicit choices) · **Reviewer:** Review/QA

## Verdict: **ship-with-fixes** → runway work needed before submissions work end-to-end

Code lands clean, gate is green. But the form only lands submissions when the two pieces of infrastructure are set up — see **Runway** below. Deploying the page is safe either way: the page loads and the client-side validation works; submission attempts return brand-voice error states until the infra lands.

## Gate
`qa-gate.sh` — typecheck ✓ · lint ✓ · tokens ✓ (2 pre-existing LEGACY) · build skipped

## Scope delta
- New page [`app/guides/join/page.tsx`](../../app/guides/join/page.tsx) — editorial header + form container.
- New client component [`app/guides/join/GuideApplyForm.tsx`](../../app/guides/join/GuideApplyForm.tsx) — all fields, honeypot, character counter, file list, `useActionState` for pending state and errors.
- New server action [`app/guides/join/actions.ts`](../../app/guides/join/actions.ts) — validates, honeypot, rate-limits, uploads to Vercel Blob, inserts into Postgres.
- Hamburger entry — new Marketplace chapter in [`app/ui/app-nav-data.ts`](../../app/ui/app-nav-data.ts): "Join as a guide" → `/guides/join`.
- New migration [`scripts/migrations/001_guide_submissions.sql`](../../scripts/migrations/001_guide_submissions.sql) — table, two indices, idempotent.
- New dep: `@vercel/blob@2.8.2`.

## Fields covered (matches brief)
- **Required:** name, email, pitch (400-char max with counter), disciplines (checkbox grid from ACTIVITIES enum).
- **Optional:** regions, website, Instagram, YouTube, up to 3 media files (image/\*, video/\*, 25 MB each).
- **Anti-spam:** honeypot off-screen; IP+daily-salt SHA-256 hash with 5-min rate limit via indexed query.

## Runway (what has to happen before submissions land in the DB)

1. **Create Vercel Blob store.** In Vercel dashboard → Storage → Create Blob → attach to `outlas-ds` project. Vercel auto-adds `BLOB_READ_WRITE_TOKEN` to the project env (all three: production, preview, development). **Alternative:** I can create via MCP (`create_storage_stores_blob`) if Hamish prefers.
2. **Run the SQL migration against production Postgres.** From the Vercel Postgres dashboard → Query tab → paste [scripts/migrations/001_guide_submissions.sql](../../scripts/migrations/001_guide_submissions.sql) → run. Idempotent, so safe to re-run.
3. **Verify** by submitting a test record from the live page; check the `guide_submissions` table shows the row and the Blob store shows the uploaded files.

Until (1) and (2) are done, the server action returns the brand-voice error line *"Something stopped the submission landing — try once more in a minute."* — expected behaviour, not a bug.

## Findings
_None in the code itself._ The runway items above are deployment prerequisites, not defects.

## Noticed
- No admin review UI (brief marked out of scope). Hamish queries Postgres directly to see pending submissions. A `/admin/guides` route would be the natural follow-up brief.
- No email notification (brief chose "no notification v1"). If Hamish wants a Slack/Discord webhook later, it's a one-line addition to the server action at the end of the INSERT block.
- Pre-existing: Next 14.2.14 advisories, `bg-ink/40` opacity-trap in map backdrop, `server-only` missing on `app/lib/data.ts`.

---
Next: `/security-ops` on `guides-apply-form` — infrastructure setup (Blob store + SQL migration), then deploy.
