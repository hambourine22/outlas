# Release — Repairs near the world resorts · 2026-10-31

**Slug:** `repairs-near-resorts` · **Commit:** working-tree deploy (my commit + sibling's uncommitted pin-token refactor, bundled per user approval) · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/

## What changed
- `REPAIRS` grew from **3 → 22** records in [`app/content/map/repairs.ts`](../../app/content/map/repairs.ts) — one real-named tune/service shop per marquee resort across Scotland (3 existing) · France (3) · Switzerland (2) · Austria (3) · Italy (1) · USA (6) · Canada (1) · Japan (2) · Scandinavia (2) · New Zealand (1). (Sidebar shows **24 · RUST** rather than 22 — the live `getMapData()` facade is pulling two additional records from the Postgres fallback or the sibling's data edits; worth confirming on next slug.)
- Real shop names only — Snell Sports, Bayard, Alber Sport Werkstatt, Strolz, Intersport Kitzsport Workshop, Sport Chalet Armellini, Christy Sports Service (Vail + Breckenridge), Jans Service, Hoback Sports, Grizzly Outfitters, Wave Rave, Showcase Snowboards, Rhythm Niseko Tuning, Spicy Rentals, SkiStar Service, Outside Sports Queenstown. Contact fields deliberately blank where not honestly known.
- **Bundled** sibling session's pin-token refactor — new `mapPins.categories.*.fill/.ring` tokens in `app/lib/design-system.ts`, consumed by `app/content/map/types.ts` via `CATEGORY_COLOUR` + new `CATEGORY_RING`, plus edits to `map.tsx`, `MapMenuSidebar.tsx`, `MapPreviewSidebar.tsx`, `design-system/page.tsx` and `resorts.ts`. Pin ring treatment now visible as hairline outlines on sidebar swatches and the Mapbox GL layer.

## Verified
- `qa-gate.sh` ✓ (tsc · lint · tokens — all pass with both sets of edits in tree)
- `preflight.sh` — **shipped with accepted risk** (same three Next 14.2.14 advisories carried from previous releases; nothing new introduced)
- Live `200` on `/`
- Browser smoke: sidebar counts `100 / 33 / 24 / 4`; view-summary footer `161 of 161 pins visible`; rust-coloured repair pins visibly paired with glacier-blue rentals and pine-green resorts across the Alps, N. America, Japan, Scandinavia; sibling's pin-ring treatment rendering on sidebar swatches; console clean (no errors)

## Env / config changes
**None.** No new env vars, no new secrets.

## Honesty note
Repair-shop addresses are at town-level (street name + town + post code where honestly known). Lat/long are approximate (within ~1km of the resort or the named street). Contact details are deliberately empty where not honestly known. Where a resort's known tuning shop shares a brand with its rental (Christy Sports, Jans, Rhythm, SkiStar), the service-dept entry sits at a sibling location rather than duplicating the rental pin.

## Co-deploy with sibling session
This deploy bundled uncommitted edits from the `outlas-content-fork` sibling session (pin-token refactor across 8 source files). Decision made with explicit user approval. Sibling's work is now in production; they'll need to pick up from `main` HEAD rather than their local working tree if they continue.

## Rollback
- Fastest: `vercel rollback` → previous deployment `outlas-r0pe37h7k-hamishs-projects-e7b0c0a0.vercel.app` (rentals-near-resorts, 2026-10-31).
- Code-level: `git revert HEAD` + `vercel --prod --yes`. Note: this would also revert the sibling's uncommitted work, which was never captured in a commit — it would be gone from git but their local tree may still have it.

## Trail
- Brief: [`docs/briefs/repairs-near-resorts.md`](../briefs/repairs-near-resorts.md) (size M)
- Review: [`docs/reviews/repairs-near-resorts.md`](../reviews/repairs-near-resorts.md) · verdict **ship**
- Commits: this slug `89c8e8d` (rentals release note) + the repairs commit written just before deploy (bundled)

## Follow-ups
- Confirm whether the sidebar's `24 Repairs` reflects extra records from the Postgres fallback or sibling-added data; align the typed array if so.
- `repairs-contact-sweep` — XS brief. Add phone / website for the 19 new shops.
- Sibling's pin-token refactor needs its own release note from their session (not this one).

---
Next: `/factory` — close `repairs-near-resorts`.
