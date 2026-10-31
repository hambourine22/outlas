# Release — Rentals near the world resorts · 2026-10-31

**Slug:** `rentals-near-resorts` · **Commit:** `931975b` · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/

## What changed
- `RENTALS` grew from **4 → 33** records in [`app/content/map/rentals.ts`](../../app/content/map/rentals.ts) — one real-named shop per marquee resort across Scotland (4 existing) · France (5) · Switzerland (4) · Austria (4) · Italy (2) · USA (6) · Canada (1) · Japan (3) · Scandinavia (2) · Southern Hemisphere (2).
- Real shop names only — Zero G, Oxygène, Nevada Sport, Bayard Sports, Mountain Air, Strolz, Jennewein, Jans, Vail Sports, Comor Sports, Rhythm (Niseko / Hakuba), SkiStar, Browns, Portillo Hotel Rentals. No fabricated phone / email / website — those fields are blank and the preview panel omits them.
- No code change. No type change. No new primitive. Pure content-layer expansion inside the shape the previous slug already shipped.

## Verified
- `qa-gate.sh` ✓ (tsc · lint · tokens)
- `preflight.sh` — **shipped with accepted risk** (same three Next.js advisories carried from `world-mountain-resorts`; no new findings introduced)
- Live `200` on `/` (verified via `curl -sI`)
- Browser smoke: Rentals sidebar count reads `33 · GLACIER`; view-summary footer reads `140 of 140 pins visible` (100 resorts + 33 rentals + 3 repairs + 4 guides); glacier-blue rental pins visibly paired with pine-green resort pins across Alps, N. America, Japan, NZ, Patagonia and Scotland

## Env / config changes
**None.** No new environment variables, no new secrets, no new build steps. Static data only.

## Honesty note
Addresses are at town-level (street name + town + post code where honestly known). Lat/long are approximate (within ~1km of resort base). Contact details are deliberately empty where not honestly known — the shape-aware preview panel already handles that. Flagged for a future data-sourcing pass (Airtable seed or a verification sweep).

## Rollback
- Fastest: `vercel rollback` → previous deployment `outlas-csclmp180-hamishs-projects-e7b0c0a0.vercel.app` (world-mountain-resorts, 2026-10-31).
- Code-level: `git revert 931975b` + `vercel --prod --yes`.

## Trail
- Brief: [`docs/briefs/rentals-near-resorts.md`](../briefs/rentals-near-resorts.md) (size M, UX gate explicitly skipped per brief)
- Review: [`docs/reviews/rentals-near-resorts.md`](../reviews/rentals-near-resorts.md) · verdict **ship**
- Commit: `931975b`

## Follow-ups (opened as their own briefs, not blockers)
- `rentals-contact-sweep` — XS brief. Add phone / email / website for the 29 new shops. Short per-shop web-verify, batch commit.
- `rentals-long-tail` — M brief. Fill in the remaining 70 world resorts (one shop each) once an Airtable or API source is wired.

---
Next: `/factory` — close `rentals-near-resorts` and capture one learning.
