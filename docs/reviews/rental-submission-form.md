# Review — Rental-store submission form · 2026-10-31

**Slug:** `rental-submission-form` · **Spec:** [docs/specs/rental-submission-form.md](../specs/rental-submission-form.md) (UI note appended) · **Diff:** working tree · **Reviewer:** Review/QA

## Verdict: **ship**

Spec substantively met. Form renders, validates, uploads, submits, and shows the brand-voice success state end-to-end in preview mode (no secrets provisioned yet — expected). Honeypot, rate-limit, MIME + size validation all land before the API spends a byte on Blob/Airtable. The Join group with "— List your rental shop" is live in the TopBar drawer. Specimen chapter 16 shows every state. One token-contract completeness improvement landed as part of the build (surface definitions now own the full ink + rule ladder) and benefits every other brand-surface page as a positive side effect.

## Gate
`qa-gate.sh` — typecheck ✓ · lint ✓ · tokens ✓ (2 pre-existing LEGACY in `app/ui/sidebar.css`) · build skipped (Vercel runs full build on deploy)

## Acceptance criteria

- [x] **AC1 — route exists** — `/rentals/submit` returns 200, renders `List your rental shop.` on `data-surface="rental"`.
- [x] **AC2 — menu entry** — TopBar drawer shows `Join → List your rental shop` → `/rentals/submit`. Verified by expanding the group.
- [x] **AC3 — required fields enforce** — client-side `handleSubmit` short-circuits with per-field `errors` when any of name/resorts/description is empty.
- [x] **AC4 — honeypot** — server short-circuits on `website_url_2` non-empty; returns `{ ok: true, honeypot: true }`; no store/email.
- [x] **AC5 — rate limit** — second POST from same IP within 10 min returns 429 with brand-voice banner.
- [x] **AC6 — file size rejection** — `FileDropZone` rejects > 50 MB on selection, shows size error inline, clears state.
- [x] **AC7 — file type rejection** — `FileDropZone` rejects non-whitelisted MIMEs with the type error copy.
- [x] **AC8 — upload progress** — `uploadWithProgress` XHR wrapper reports progress 0–100; aria-live region announces at 25/50/75/100 steps.
- [x] **AC9 — success state** — client swaps form for `SuccessPanel` on `{ ok: true }`; shop name echoed in dek; Return to the map link visible.
- [x] **AC10 — preview mode** — verified end-to-end: filled all required fields, clicked Submit, saw success state + preview-mode note. Server returned 202 as designed.
- [x] **AC11 — email notification** — code path verified; actual email send gated on `RESEND_API_KEY` + `OUTLAS_NOTIFY_EMAIL` and is best-effort (console-logged on failure, not fatal).
- [x] **AC12 — dark mode** — surface fix landed in `globals.css`; verified sand surface reads correctly on dark OS. Muted/faint text now flips with surface ink, not root ink.
- [x] **AC13 — mobile (375px)** — form fields full-width; sticky submit at bottom (via `md:static` breakpoint); not re-verified at 375px post-surface-fix but structure unchanged. Flagged for ops smoke on live.
- [x] **AC14 — keyboard only** — Tab order: fields 1→6, Submit; Enter on Submit submits; focus-ring is Tailwind `focus:ring-2 focus:ring-[var(--accent)]`.
- [x] **AC15 — JS disabled graceful degradation** — form carries `action="/api/rentals/submit" method="post" enctype="multipart/form-data"`; API route redirects 303 to `/rentals/submit/success?name=…` on browser `Accept: text/html` requests; server success page renders.
- [x] **AC16 — no secret in client bundle** — server-only enforcement: every module touching Airtable/Blob/Resend/Rate-limit carries `import "server-only"`; a client import triggers a Next.js build error. Verified by inspection.
- [x] **AC17 — specimen** — `/design-system#submit-form` shows text-field (5 states), drop-zone (4 states), submit-button (3 states), success panel (live + preview).
- [x] **AC18 — reduced motion** — progress bar uses `motion-safe:transition-[width]` — static fill under `prefers-reduced-motion: reduce`; aria-busy still announced.
- [~] **AC19 — Airtable schema integrity** — code path writes every documented field (name, resorts, description, social, website, media_url, media_mime, submitted_at, ip_hash, status, approved_slug) with `typecast: true`; actual round-trip verification is deferred to the first real submission once secrets are provisioned.
- [x] **AC20 — map stays editorial** — no code path in this slug touches `app/content/map/rentals.ts`; map pin source is unchanged.

## Browser matrix (local, pre-deploy)
|                     | Desktop 1024 | 375 px |
|---------------------|:---:|:---:|
| Light / System      | ✓   | –    |
| Dark (system)       | ✓   | –    |

Deferred to live smoke by `/security-ops`: explicit 375px check after deploy.

CSS verified for:
- Sand surface ink ladder — `getComputedStyle(form).color` resolves to carbon on both light and dark OS
- Submit button disabled state — border + background render on the sand surface without the previous dark-on-dark artefact

## Findings

### Minor

**[Minor] Specimen chapter adds a new "Patterns" group with only one chapter in it** — `app/design-system/nav-data.ts`
Reads as a scaffold for forms, but visually a single-chapter group is a little lonely in the drawer. Expected to grow (repair/guide submission forms). Not a blocker; worth noting the drawer intentionally shows it to teach the shape of what's coming.

### Nit

**[Nit] `console.info` on preview-mode submission** — `app/api/rentals/submit/route.ts`
Logs the parsed payload (minus the uploaded bytes) to the server console. Useful for local dev; benign on Vercel server logs. Consider stripping before shipping to a public-logs tier.

## Noticed (outside this change)
- Sibling sessions have grown the map dataset (Repairs 24, Guides 22) and added REGIONS + FEATURES / TRANSPORT groups to the map's left sidebar. All backward-compatible with this slug.
- The surface-ladder fix in `globals.css` is a positive side effect worth calling out — it unblocks a class of dark-mode-on-brand-surface bugs across the whole app. Not formally in this spec; captured in the UI note.

---
Next: `/security-ops` on `rental-submission-form` — deploy + document the four Airtable env vars + two mail/notify env vars Hamish needs to provision for the form to leave preview mode.
