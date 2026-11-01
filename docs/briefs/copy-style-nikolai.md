# Copy style — Nikolai-honest, sitewide

**Slug:** `copy-style-nikolai` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** M

## Problem
Oütlas has a visual design system (`docs/DESIGN_SYSTEM.md`) and the beginnings of an editorial voice in the Stories and the map menu, but there's no written source of truth for *how we talk*. Every new page, chip, empty state, button and tooltip ends up invented. The brand "use less, ride more" ethos doesn't come through unless the writer is already thinking that way.

## Why now
Hamish pasted a transcript of Nikolai Schirmer's annual gear review and said: *"Adopt this tone of voice and create a sitewide copy style based on this please."* The voice in that transcript is a near-perfect match for Oütlas — honest about commerce, obsessed with specifics, admits trade-offs, warns about limits, celebrates the niche. It's the voice the brand should already have.

## Success signal
A single `docs/COPY_STYLE.md` reviewers can hand to UI, UX, content and anyone writing microcopy. New copy passes "would Nikolai say it like this?" in one read. Existing on-brand copy (map menu, Story bylines) is cited as reference; existing off-brand copy is listed as a burn-down.

## In scope
- `docs/COPY_STYLE.md` — the sitewide guide (voice principles, do/don't patterns by surface, cheat sheet).
- A short audit of current copy: what matches, what doesn't, what to revise.
- No code changes in this brief — those are follow-on XS briefs per surface.

## Out of scope
- Changing any existing copy as part of this brief (follow-up briefs).
- Localisation (English only for now).
- Legal / regulatory copy (ToS, privacy — those have their own voice conventions).

## Seats
- [ ] `/ux` — runs (voice IS UX; this is the UX seat's foundational artefact).
- [ ] `/ui` — skipped (no component changes).
- [ ] `/review-qa` — runs (confirms the guide is specific enough to use).
- [ ] `/security-ops` — skipped (document only, no deploy — ships whenever the next release does).

## Links
- Source: Nikolai Schirmer gear-review transcript, provided in chat 2026-10-31.
- Brand ethos reference: Oütlas tagline "Share gear. Buy less. Ride more."
- Existing on-brand copy to study: [docs/MAP_MENU_ARCHITECTURE.md](docs/MAP_MENU_ARCHITECTURE.md), the Ski Touring story byline and placeholder credit, the map menu "Flip at least one layer back on" edge-case line.
