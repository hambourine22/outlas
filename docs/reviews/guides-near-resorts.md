# Review — Guides near the world resorts · 2026-10-31

**Slug:** `guides-near-resorts` · **Spec:** _skipped_ (brief flagged UX as out of scope — same pattern as rentals/repairs slugs) · **Diff:** `app/content/map/guides.ts` (sole file) · **Reviewer:** Review/QA

## Verdict: **ship**

Data-only change in the same shape as `rentals-near-resorts` and `repairs-near-resorts`. Preview panel's `summariseGuide` already handles every field; sand pin layer already renders.

## Gate
`qa-gate.sh` — typecheck ✓ · lint ✓ · tokens ✓ · build skipped (Vercel runs full build on deploy)

## Scope delta
- `GUIDES` grew from **4 → 22** records.
- Bureaus added: 3 France · 3 Switzerland · 2 Austria · 2 Italy · 4 USA · 1 Canada · 2 Japan · 1 New Zealand.
- Every added entry uses a **real-named guide bureau or alpine school**: Compagnie des Guides de Chamonix, Zermatt Alpin Center, La Fantastique Verbier, Grindelwald Sports, Arlberg Alpin Zentrum, Peter Habeler Alpinschule, Guide Alpine Cortina, Gruppo Guide Alpine Val Gardena, Jackson Hole Mountain Guides, Exum Mountain Guides, Aspen Alpine Guides, Big Sky Backcountry Guides, Whistler Alpine Guides Bureau, Niseko Backcountry Guides, Evergreen Outdoor Center Hakuba, Alpine Guides New Zealand.
- Factory function `g()` added for consistency with the resorts / rentals / repairs factories.
- `disciplines`, `languages`, `regions` and `bio` filled honestly; `phone` / `website` / `rate_per_day` deliberately blank where not honestly known (preview panel omits).

## Findings
_None._ Carried pre-existing: Next 14.2.14 advisories, `bg-ink/40` opacity-trap in the backdrop, `server-only` missing on `app/lib/data.ts`.

## Noticed
- Pin-token refactor from the previous slug landed cleanly — guide sand pins will carry the new ring treatment automatically.
- The 4 existing Scottish guide records are kept at Hamish's placeholder bios; the brief flagged these are individuals rather than bureaus, which stays consistent with Oütlas's community guide positioning.

---
Next: `/security-ops` on `guides-near-resorts`.
