# Review — Repairs near the world resorts · 2026-10-31

**Slug:** `repairs-near-resorts` · **Spec:** _skipped_ (brief flagged UX as out of scope — pure data expansion, same pattern as `rentals-near-resorts`) · **Diff:** `app/content/map/repairs.ts` (sole file) · **Reviewer:** Review/QA

## Verdict: **ship** (pending sibling coordination — see Noticed)

Data-only change, same pattern as rentals. Preview panel and rust pin layer already handle every record field.

## Gate
`qa-gate.sh` — typecheck ✓ · lint ✓ · tokens ✓ · build skipped (Vercel runs full build on deploy)

## Scope delta
- `REPAIRS` grew from **3 → 22** records.
- Shops added: 3 France · 2 Switzerland · 3 Austria · 1 Italy · 6 USA · 1 Canada · 2 Japan · 2 Scandinavia · 1 Southern Hemisphere.
- Every added shop uses a real, named tune/service shop at or near the resort (Snell Sports, Bayard, Alber, Strolz, Christy Sports Service, Jans, Hoback, Grizzly Outfitters, Wave Rave, Showcase, Rhythm Tuning, Spicy, SkiStar Service, Outside Sports).
- Where a resort's known tuning shop shares a brand with its rental (Christy, Jans, Rhythm, SkiStar), service-dept address or sibling location is used — not a duplicate pin.
- Contact fields (`repair_phone`, `repair_website`) deliberately blank where not honestly known.

## Findings
_None._ Carried pre-existing: the three Next 14.2.14 advisories, the `bg-ink/40` opacity-trap in the backdrop, `server-only` missing on `app/lib/data.ts` — unchanged.

## Noticed
Sibling session `outlas-content-fork` is actively refactoring pin tokens / preview panel / map visuals (uncommitted work on 8 source files: `types.ts`, `mapboxDefinitions.ts`, `map.tsx`, `MapMenuSidebar.tsx`, `MapPreviewSidebar.tsx`, `design-system/page.tsx`, `app/lib/design-system.ts`, `app/content/map/resorts.ts`). A `vercel --prod` from this tree would ship their partial work alongside the repair data. Coordination required before deploy — pinged the session.

---
Next: `/security-ops` on `repairs-near-resorts` (after sibling clears).
