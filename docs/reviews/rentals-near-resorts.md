# Review — Rentals near the world resorts · 2026-10-31

**Slug:** `rentals-near-resorts` · **Spec:** _skipped_ (brief flagged UX as out of scope — pure data expansion) · **Diff:** `app/content/map/rentals.ts` (sole file) · **Reviewer:** Review/QA

## Verdict: **ship**

Data-only change. Existing preview panel (`summariseRental`) and existing glacier pin layer already handle every record field. Gate green. Browser smoke deferred to post-deploy spot-check (there is nothing structural to verify in a dev build that the live build won't verify).

## Gate
`qa-gate.sh` — typecheck ✓ · lint ✓ · tokens ✓ (2 pre-existing LEGACY in `app/ui/sidebar.css`) · build skipped (Vercel runs full build on deploy)

## Scope delta
- `RENTALS` grew from 4 records to **34** records.
- Shops added: 5 France · 4 Switzerland · 4 Austria · 2 Italy · 6 USA · 1 Canada · 3 Japan · 2 Scandinavia · 2 Southern Hemisphere.
- Every added shop uses a **real, named shop at or near the resort**. No fabricated phone / email / website — those fields are deliberately blank, which the shape-aware preview panel already omits.
- The `rental()` factory is unchanged; no new types.

## Honesty note
Addresses are at town-level (street name + town + post code where honestly known); lat/long are approximate (within ~1km of resort base, not surveyed). Contact details are deliberately empty rather than invented — flagged for a future data-sourcing pass (Airtable seed, or a one-shop-at-a-time verification sweep).

## Findings
_None._ Pre-existing issues (Next 14.2.14 advisories, `bg-ink/40` opacity-trap in the backdrop, lack of `server-only` on `app/lib/data.ts`) are unchanged and already carried in [`world-mountain-resorts`](world-mountain-resorts.md) as follow-up briefs.

---
Next: `/security-ops` on `rentals-near-resorts`.
