# Rental-store submission form — spec

**Slug:** `rental-submission-form` · **Brief:** `docs/briefs/rental-submission-form.md` · **UX:** Hamish · **Date:** 2026-10-31 · **Status:** ready-for-ui

## 1. Problem & success signal

A rental shop can't currently put itself on Oütlas — the dataset is 100% hand-curated. For the map to grow past the 34 shops that landed in `rentals-near-resorts` without Hamish typing records one by one, shops need a honest, short, well-designed way to submit themselves. When this ships, a shop owner (phone, lunch break, standing in their own store) can fill in six fields in under two minutes, attach a photo or short video, submit, see a brand-voice confirmation, and know their listing is in the queue for Hamish to review. The map itself stays editorial — no submission ever goes live without Hamish's one-click approval in Airtable.

## 2. Users & context

- **Who:** rental-shop owner or staff member. Not a rider — this is the one Oütlas flow where the audience is the provider submitting themselves.
- **Device & moment:** phone first — the shop owner is between customers, standing at the counter, typing one-handed. Desktop second (admin at a desk later in the day).
- **UX moment:** `data-surface="rental"` — sand canvas, pine accent. The entire form page sits inside the rental surface, which is the brand's visual contract for every rental touchpoint. This also distinguishes the form from the navigation and editorial surfaces at a glance.
- **Entry points:** TopBar hamburger drawer → **Join** group → **List your rental shop** row (new); plus a direct URL `/rentals/submit` for future email / share-link traffic.

## 3. Flow

### Primary path
1. Shop owner opens the TopBar drawer, taps **Join → List your rental shop**. Lands on `/rentals/submit`.
2. Page renders on the `rental` surface — sand canvas, pine accent — with a short header (`List your rental shop`) and a one-line dek (`Share where you are, what you rent, and one picture or clip. We'll be in touch within a week.`).
3. The six fields render top-to-bottom. The honeypot field is visually hidden (not a seventh user-visible field).
4. Shop owner fills in Name → Resorts served → Description → Social → Website → attaches a photo or video (drag-drop or tap-to-pick). Browser shows the chosen filename and a tiny preview thumbnail.
5. Shop owner taps **Submit**. Button changes to a label-caps `Submitting…` with a small hairline-stroke progress strip under the file field while the upload runs.
6. Server accepts the submission (or returns a specific, brand-voice error). On success, page swaps to the **submitted** state — a short "We've got it" surface with the shop's name echoed back and a one-line "Hamish will review within a week". A faint `Return to the map →` link.
7. Hamish gets an email with a direct Airtable link. He opens the record, sanity-checks it, flips `status` from `pending` to `approved`. (The sync that lifts approved submissions into `app/content/map/rentals.ts` is a separate slug — out of scope for v1.)

### Branches & states

- **Empty page (first load):** form renders with all fields at `default`; nothing is required to be touched to see the form; Submit is disabled until the three required fields have content.
- **Field invalid as user types:** inline error below the field in `rust`-tinted hairline, not a modal; error clears on the next edit.
- **File too big (>50 MB):** inline error below the file field: `This file is {X} MB. Keep it under 50 MB — compress or crop and try again.` No submission attempt; the chosen file is cleared.
- **File wrong type:** inline error: `We take photos (JPG · PNG · WEBP) and short videos (MP4 · MOV). Try one of those.`
- **Rate-limited (same IP within 10 minutes):** on Submit, server returns 429; page renders a page-level banner: `We've had a submission from this network very recently. Try again in a few minutes.` No form content is cleared.
- **Honeypot filled (bot):** server returns 200 with a fake success; form shows the normal success page. We don't tell the bot it failed.
- **Network / server error:** page banner: `Something broke between here and us. Nothing was saved. Try Submit again, or email hello@outlas.cc.` Form content stays.
- **Preview mode (secrets not provisioned):** server returns 202 with `{ ok: true, preview: true }`; page renders the normal success state with one additional hairline note at the bottom: `Preview mode — form is wired up but your submission wasn't stored yet. Secrets land soon.`
- **Returning user:** page re-renders with the form reset; browser's native autofill handles name/email history. No `localStorage` of draft state in v1 — a lost draft is cheaper than a privacy surprise.
- **Narrow (≤ 640):** form fields stack full-width. Submit becomes a sticky-bottom button so it stays reachable while scrolling the form.
- **Reduced motion:** progress strip renders as a static filled bar at 100% during upload, no animation.
- **JavaScript disabled:** `<form action="/api/rentals/submit" method="post" enctype="multipart/form-data">` degrades gracefully — the browser does a native POST and the server returns an HTML success page with the same copy as the client success state. No upload progress affordance (acceptable degradation).

## 4. Content

### Page copy

| Where | Copy | Notes |
|---|---|---|
| `<title>` | `List your rental shop — Oütlas` | |
| H1 | `List your rental shop.` | Vollkorn, display-2. One sentence, with the period. |
| Dek | `Share where you are, what you rent, and one picture or clip. We'll be in touch within a week.` | font-ui, text-sm, ink-muted. |
| Section header before form | `About the shop` | `.label` text-ink-faint |
| Section header before upload | `One picture or clip` | `.label` text-ink-faint |
| Submit button | `Submit` → `Submitting…` (during) → _(swapped for success state)_ | Verb-first, no exclamation. |
| Success H1 | `We've got it.` | Vollkorn display-2 on a `rental` surface — same canvas, same ink. |
| Success dek | `Thanks, {name}. Hamish will review your listing within a week.` | `{name}` is the submitted shop name, echoed back for trust. |
| Success link | `Return to the map →` | font-ui text-sm text-ink underlined on hover. |
| Preview-mode note | `Preview mode — form is wired up but your submission wasn't stored yet. Secrets land soon.` | `.micro` text-ink-faint, under the Return link. |

### Field schema

Each row = one `<label>` + `<input>` (or `<textarea>`, or custom file picker). Required fields are marked by an asterisk `*` only in the `aria-label`, not visually (the brand uses a short `Required` label caption instead; see table).

| # | Field key | Visible label | Placeholder | Help text | Error (invalid) | Max | Required? |
|---|---|---|---|---|---|---|---|
| 1 | `name` | **Shop name** | `e.g. Zero G` | — | `Shop needs a name.` | 80 chars | yes |
| 2 | `resorts` | **Resorts you serve** | `e.g. Chamonix, Val d'Isère` | `Comma-separate if more than one.` | `Name at least one resort.` | 160 chars | yes |
| 3 | `description` | **One line about the shop** | `e.g. Freeride-focused rental on Rue Joseph Vallot.` | `Keep it to one sentence — we'll edit lightly before publishing.` | `Give us a short line.` | 200 chars | yes |
| 4 | `social` | **Social handle or link** | `e.g. instagram.com/zerogchamonix` | `Instagram, TikTok, YouTube — one is fine.` | `Looks off — paste the full link.` | 160 chars | no |
| 5 | `website` | **Website** | `e.g. zerog-chamonix.com` | — | `Looks off — paste the full link.` | 160 chars | no |
| 6 | `media` | **One picture or clip** | — _(custom file picker)_ | `Photos: JPG, PNG, WEBP. Videos: MP4, MOV. 50 MB cap.` | _(see state matrix below)_ | 50 MB | no |

Honeypot (not visible): `<input name="website_url_2" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true">` positioned off-screen via `.sr-only`. Field name chosen to look like something a bot's generic form-filler will target.

### State matrix — media field

| State | Visible treatment | aria |
|---|---|---|
| **Default** | Dashed hairline-rule drop zone (`border-rule`), label-caps `Drop a file or tap to pick`, help text below | `role="button" aria-label="Choose a photo or short video to upload"` |
| **Filled** | Small thumbnail (image) or `.label` filename pill (video), `Change` button in `.label` | aria-label updates to `Chosen: {filename}` |
| **Invalid (size)** | Red-tinted hairline (`--rule-strong` with rust ink) with the error copy inline | `aria-invalid="true"` + `aria-describedby` pointing at the error |
| **Invalid (type)** | Same shape, type-specific error copy | — |
| **Submitting** | Hairline progress strip below the drop zone, 0 → 100% as the fetch streams; filename still shown | `aria-busy="true"` + `aria-live="polite"` announcing `Uploading {filename}, {n}%` on every 25% step |
| **Submitted** | Field disappears (page has swapped to success state) | — |

### Submit-button state matrix

| State | Label | Enabled? | aria |
|---|---|---|---|
| **Default (incomplete)** | `Submit` | no — disabled | `aria-disabled="true"` |
| **Default (ready)** | `Submit` | yes | — |
| **Submitting** | `Submitting…` | no | `aria-busy="true"` |
| **Submitted** | _(button removed; success state renders)_ | — | — |
| **Error** | `Try again` | yes | `aria-live="assertive"` on the surrounding banner |

### Error copy (page-level banners)

| Trigger | Copy |
|---|---|
| Rate-limited (429) | `We've had a submission from this network very recently. Try again in a few minutes.` |
| Network timeout | `Took too long. Nothing was saved. Try Submit again when you're on a stronger signal.` |
| Server error (500) | `Something broke between here and us. Nothing was saved. Try Submit again, or email hello@outlas.cc.` |
| JavaScript disabled, server returned non-2xx | Same error page template as above, server-rendered. |

### Email to Hamish (notification)

Plain text; subject line + body:

```
Subject: New rental submission — {name}

{name} just submitted their shop.

Resorts:   {resorts}
Shop:      {description}
Social:    {social or "—"}
Website:   {website or "—"}
Media:     {media_url or "none"}

Open in Airtable: {direct_record_link}

(Replying to this email does nothing — the shop didn't share contact details yet. The social or website link above is your way back to them.)
```

## 5. Structure

- **Reuses:** TopBar + Sidebar from `app/design-system/Nav.tsx` (one new chapter entry under a new group); `.label` / `.micro` utilities; display-2 and body type from the type scale; hairline rules; the `rental` surface already defined in `globals.css` (sand canvas, pine accent, carbon ink).
- **New primitives (all additive, scoped to this slug):**
  - `RentalSubmitForm` — client component holding form state, upload progress, submit orchestration.
  - `FileDropZone` — the drag-and-drop + tap-to-pick media field; small enough to not deserve its own chapter but exposed via the specimen so the pattern can be reused.
  - `SubmissionSuccess` — the `We've got it` surface; a server component that reads the submitted name from the URL (`?name=…`) or a short-lived cookie, so the success state survives a form POST that follows the no-JS degradation path.
  - `/api/rentals/submit/route.ts` — server-only API route; orchestrates Vercel Blob + Airtable + Resend; carries `import "server-only"` on all SDK-touching modules.
- **Specimen chapter needed in `/design-system`:** yes, under `Patterns · Forms` — new section `Submit form` showing the field types in all six states and the FileDropZone in all five states. Also doubles as a style reference for future provider submission forms (repairs, guides).
- **Content source:** none. This slug writes content, not reads it. The dataset the form submissions eventually land in is the Airtable base provisioned under `/security-ops` — content layer unaffected until a future sync-into-code slug.
- **New menu group — `Join`:** added to [`app/design-system/nav-data.ts`](../../app/design-system/nav-data.ts) with one Chapter row:
  ```ts
  export const APP_GROUPS = [
    { key: "explore",     label: "Explore"     },
    { key: "stories",     label: "Stories"     },
    { key: "marketplace", label: "Marketplace" },
    { key: "join",        label: "Join"        },   // NEW
    { key: "system",      label: "System"      },
  ];
  // in APP_CHAPTERS:
  { n: "—", slug: "rentals-submit", title: "List your rental shop", group: "join", href: "/rentals/submit" },
  ```
  `n: "—"` keeps the number column honest — this isn't a numbered chapter, it's a call to action. The row renders the same but reads as an invite rather than a section.

## 6. Accessibility requirements

- **Keyboard path:** Tab through form in field order (1 → 6) → Submit. Enter on Submit triggers submission from any field. Escape clears the current field only when the field is a file-drop zone with an attached file (removes the attachment, returns to default).
- **Names:** each field's visible label is its accessible name (via `<label htmlFor={id}>`). The honeypot has `aria-hidden="true"` and `tabIndex={-1}` so neither keyboard nor assistive tech reaches it. Submit's accessible name updates between `Submit`, `Submitting`, and `Try again` across its three enabled states.
- **Errors:** inline errors use `aria-invalid="true"` on the field + `aria-describedby` pointing at the error paragraph. Page-level banners are `role="alert"` with `aria-live="assertive"` so a screen reader announces them immediately.
- **Upload progress:** `aria-live="polite"` region announcing percent at 25 / 50 / 75 / 100 steps (not every tick — too noisy).
- **Text classes:** page H1 is Vollkorn display-2 (large text — 3:1 contrast target). Field labels are small text, Archivo Narrow (4.5:1 target). Help text is small text in `--ink-muted` (60% carbon on sand — 5.4:1, passes 4.5:1).
- **Motion:** progress strip animates from 0 → 100% as a width transition. Under `prefers-reduced-motion: reduce`, the strip renders as a static filled bar at upload-start and stays filled until the fetch resolves — the busy state is still signalled via `aria-busy`.
- **Targets:** every button and file-drop zone is ≥ 44 × 44 at mobile breakpoints. The honeypot is 1×1 and off-screen but has no tap/focus target.

## 7. Acceptance criteria

- [ ] **AC1 — route exists** — Given a cold load, when the user navigates to `/rentals/submit`, then the page responds with `200` and renders the H1 `List your rental shop.` on a `data-surface="rental"` canvas.
- [ ] **AC2 — menu entry** — Given any page, when the user opens the TopBar drawer, then a new group `Join` appears containing one row `List your rental shop` that links to `/rentals/submit`.
- [ ] **AC3 — required fields enforce** — Given the user hasn't filled Name, Resorts and Description, when they tap Submit, then nothing posts and the three empty fields render their invalid-state error copy inline.
- [ ] **AC4 — honeypot** — Given a `POST` to `/api/rentals/submit` with `website_url_2` non-empty, then the server returns `200` with a success body but **does not** write to Airtable and **does not** email Hamish.
- [ ] **AC5 — rate limit** — Given one successful submission from an IP, when a second `POST` arrives from the same IP within 10 minutes, then the server returns `429` with the brand-voice banner copy; the first submission is unaffected.
- [ ] **AC6 — file size rejection** — Given a file selected at > 50 MB, when the user tries to attach it, then the client shows the size-error copy inline, the file is cleared from state, and no `POST` is made.
- [ ] **AC7 — file type rejection** — Given a file whose MIME is not in the allowed set, when the user tries to attach it, then the client shows the type-error copy inline and the file is cleared.
- [ ] **AC8 — upload progress** — Given a submission with media, when the fetch is in flight, then the Submit button reads `Submitting…`, the progress strip under the file field advances from 0 to 100%, and the aria-live region announces at the 25% / 50% / 75% / 100% marks.
- [ ] **AC9 — success state** — Given a successful `POST`, when the server returns `200` with `{ ok: true }`, then the form is replaced by the `We've got it.` surface, the shop's name is echoed in the dek, and a `Return to the map →` link is visible.
- [ ] **AC10 — preview mode** — Given any required secret (`AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `BLOB_READ_WRITE_TOKEN`) is missing on the server, when a valid `POST` arrives, then the server returns `202` with `{ ok: true, preview: true }`, the normal success state renders, and the `Preview mode — form is wired up but your submission wasn't stored yet` note shows at the bottom.
- [ ] **AC11 — email notification** — Given a non-preview successful submission, when the Airtable write succeeds, then a single email is sent to `OUTLAS_NOTIFY_EMAIL` with subject `New rental submission — {name}` and a body matching the template under §4.
- [ ] **AC12 — dark mode** — Given the theme is dark (or system on a dark OS), when the page renders, then the `rental` surface still reads as sand canvas with carbon ink (brand surfaces are theme-independent — this is the system's contract, not a bug).
- [ ] **AC13 — mobile (375px)** — Given a 375px viewport, when the page renders, then fields stack full-width with 16px side gutter, Submit is sticky to the bottom edge, no horizontal scroll, and the file-drop zone is at least 44px tall.
- [ ] **AC14 — keyboard only** — Given keyboard-only navigation, when the user Tabs from the TopBar through the form, then focus visits the Join link, then field 1 → 6, then Submit, in that order; each stop shows a visible focus ring; Enter on Submit submits the form.
- [ ] **AC15 — JS disabled graceful degradation** — Given JavaScript is disabled, when the user submits the form, then the browser POSTs natively to `/api/rentals/submit`, the server returns an HTML success response rendering the same copy as the client success state, and the submission still writes to Airtable (or preview-mode responds the same).
- [ ] **AC16 — no secret in client bundle** — Given a `pnpm build` output, when the client bundle is grep'd, then none of `AIRTABLE_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY` or `AIRTABLE_BASE_ID` string literals appear in any client JS chunk.
- [ ] **AC17 — specimen** — Given the `/design-system` route, when the user scrolls to `Patterns · Forms · Submit form`, then every field state (default / filled / invalid / submitting / submitted / error) renders at least once; the FileDropZone shows all five states.
- [ ] **AC18 — reduced motion** — Given `prefers-reduced-motion: reduce`, when a submission is in flight, then the progress strip renders as a static filled bar from upload-start without animation; `aria-busy` is still set and announced.
- [ ] **AC19 — Airtable schema integrity** — Given a successful non-preview submission, when the record lands in Airtable, then every schema field documented in the brief is populated with the correct type (name/resorts/description/social/website/media_url/media_mime/submitted_at/ip_hash/status/approved_slug), and `status` is `pending`.
- [ ] **AC20 — map stays editorial** — Given a submission has landed in Airtable with `status: pending`, when a rider loads the map, then no new pin appears for that submission; the pin set is still read exclusively from `app/content/map/rentals.ts`.

## 8. Assumptions & open questions

| # | Assumption | Confidence | If wrong |
|---|---|---|---|
| A1 | Shop owners are mostly on mobile with intermittent signal | High | Reduce the client-side JS footprint further and lean harder on the server-rendered no-JS fallback |
| A2 | Six fields is few enough to feel honest and not an interrogation | High | Prune to four — name / resorts / description / media — and drop social + website; collect those in Hamish's follow-up email |
| A3 | Hamish is OK moderating in Airtable (vs a bespoke admin UI) | High (user confirmed) | Build a lightweight admin page in a follow-up slug |
| A4 | A honeypot + per-IP rate limit is enough anti-abuse for v1 | Medium | Add a 1-click CAPTCHA (Cloudflare Turnstile or similar) as a follow-up — keep the honeypot either way |
| A5 | Email per submission scales until ~10 submissions / week | Medium-High | Switch to a daily digest when volume outgrows per-event email |
| A6 | 50 MB is enough for a short clip without needing resumable upload | Medium | Add a `tus` or chunked upload layer in a v2 slug; keep single-request POST for v1 |
| A7 | Vercel Blob public URLs are OK to store in Airtable long-term | High | Pre-sign per-view, or proxy through our own domain — both are refactors we can do without changing the submission flow |
| A8 | The in-memory IP rate limiter is good enough despite cold starts | Medium | Move to Upstash Redis or Vercel KV when the first bot wave actually arrives |

**Counter-evidence:** forms with upload fields are famously fragile on mobile. Instagram and Facebook have invested millions in their file pickers for exactly this reason. Our safety net is the no-upload path — the `media` field is optional, so a shop that can't upload can still submit. If uploads prove flaky, we lose a photo but not the submission.

**Open questions (≤ 3):**
1. **Which notification service — Resend, Postmark, or Mailgun?** — Any works. Spec names Resend because the SDK is one function and the pricing is simple; `/security-ops` has final say when provisioning.
2. **Do we need an email field on the form?** — Not for v1. The social or website link is Hamish's way back. If the shop has neither, Hamish defers. Reconsider only if the no-contact rate exceeds 30% of submissions.
3. **Should the TopBar `Join` group ship empty under design-system but gated behind a build flag until the Airtable base is provisioned?** — My call: ship the row live, let it hit preview mode until secrets land. The preview-mode note is honest; a hidden row would be more confusing.

## 9. Appendix

### Options considered

- **A — Form on the existing /rentals index page** (collapsible section). Rejected: dilutes the index page's job and loses the sand-surface treatment that makes the form feel like its own moment.
- **B — Multi-step wizard** (one field per screen). Rejected: six fields fit on one screen even at 375px. A wizard adds friction without reducing the amount asked for.
- **C — Rich text / Markdown description field** with a preview. Rejected: shop owners aren't writers; a single plain sentence is the honest input.
- **Chosen — single-screen plain form, sand surface, honest field count, moderation in Airtable.**

### References

- Pentagram's "Join us" form patterns (hairline rules + label-caps + one submit) — matches our editorial economy.
- Vercel Blob client-upload docs (streaming multipart body) — the upload shape the API route is written to.
- Airtable PAT scopes doc — minimum scope principle for the token.
- No full HUX run (phases 1–2) performed here because the brief and user decisions were already specific; HUX verification protocol applied in assumption table above.

---
Next: `/ui` on `rental-submission-form`. UI decides: exact dash pattern on the drop-zone border (within the `--rule`/`--rule-strong` tokens), progress-strip height in rungs of 4, specimen chapter layout, which notification SDK to pin in `package.json` (default: `resend`; adjust if `/security-ops` prefers another).

---

## UI note (2026-10-31)

### Structure chosen

```
app/
  api/rentals/submit/route.ts         # POST handler; node runtime, 60s maxDuration
  lib/server/
    submission.ts                      # types + env helpers + preview-mode detector
    blob.ts                            # Vercel Blob REST via fetch
    airtable.ts                        # Airtable REST via fetch
    resend.ts                          # Resend REST via fetch
    rate-limit.ts                      # in-memory LRU IP buckets
    ip-hash.ts                         # SHA-256 (ip + daily salt) for Airtable audit
  rentals/submit/
    page.tsx                           # server component; rental surface + form shell
    RentalSubmitForm.tsx               # client; state, XHR progress, honeypot
    FileDropZone.tsx                   # client; 4 states (default/filled/invalid-size/invalid-type)
    success/page.tsx                   # server-rendered success for no-JS POST
  design-system/
    nav-data.ts                        # chapter 16 + patterns group
    page.tsx                           # SubmitFormSpecimen under chapter 16
  ui/app-nav-data.ts                   # JOIN group + rentals-submit row
app/globals.css                        # surface definitions extended (see Tokens)
```

### Dependencies
**Zero new npm packages.** All three external services (Airtable, Vercel Blob, Resend) are called via native `fetch` against their REST APIs. The UI contract's "don't add a dependency for a component" rule stands — bundle stays small, fewer things to upgrade, no SDK layer between the server and the HTTP it ultimately speaks.

### Tokens added
`app/globals.css` surface definitions now override the **full ink + rule ladder**, not just `--canvas` / `--ink` / `--accent`. Each surface (rental, repair, story, manifest, carbon) also sets:
- `--canvas-raised`
- `--ink-muted` and `--ink-faint` (based on each surface's own ink colour)
- `--rule` and `--rule-strong`

**Why:** on a dark OS, the previous surface definitions left `--ink-muted` / `--ink-faint` as snow-tinted (inherited from the dark root), while `--ink` flipped to the surface's dark-ink colour (e.g. carbon on sand). The result was placeholder, help, and disabled-button text that was snow-on-sand — illegible. This is a token-contract completeness fix the whole brand-surface system benefited from; the Rental form is the first consumer that put it under enough load to notice.

**Downstream pages affected (positive):** `/design-system` surface chapter examples, `/stories/*` story heroes, and any `data-surface="rental"` section. All now render muted/faint text in the surface's own ink colour regardless of OS theme.

### Deviations from spec
- **None material.** Spec section 5 said "no new primitives beyond form controls themselves" — honored. Form controls are plain `<input>` / `<textarea>` + the one `FileDropZone` composite, no new abstraction layer.
- Specimen groups five text-field states + four drop-zone states + three button states + two success-state variants — matches the state matrices in spec section 4.

### Preview mode (secrets not provisioned)
When any required secret is missing, `/api/rentals/submit` returns `202 { ok: true, preview: true }`, the client renders the normal success state plus the `micro` label-caps `PREVIEW MODE — FORM IS WIRED UP BUT YOUR SUBMISSION WASN'T STORED YET. SECRETS LAND SOON.` note. Verified end-to-end at `http://localhost:3200/rentals/submit`.

### Verified in-browser
- `/rentals/submit` renders on sand surface, all 5 text fields + file-drop zone + submit button legible on both light and dark OS (surface fix proved)
- Required-field disabled Submit state is readable (snow background, muted carbon text, hairline border)
- Required-field enabled Submit state is dark fill, snow text
- Submit end-to-end: fill required fields → click Submit → "We've got it." success panel with name echoed + preview-mode note
- TopBar hamburger drawer shows new **JOIN** group with `— List your rental shop` row

### Where to look in the specimen
`/design-system#submit-form` — chapter 16 under the new **Patterns** group. Five sections: text-field states, drop-zone states, submit-button states, success panel (live + preview), plus a link to the live form.

### Known pre-existing issues not addressed here
- Next 14.2.14 critical advisories (same three carried from previous releases). This slug ships over them with accepted risk as agreed with Hamish earlier today.

Next: `/review-qa` on `rental-submission-form`.
