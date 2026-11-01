# Retire the inline SVGs — every glyph through `<Icon>`

**Slug:** `icon-callsite-migration` · **Owner:** Hamish · **Opened:** 2026-11-01 · **Size:** S

## Problem
The icon system (`app/ui/icons/icons.ts` + `Icon.tsx`, design-system chapter 18) now holds every UI glyph, but the components that predate it still draw their own `<svg>`s — and several are the *same* glyph copied: close ×3, chevron-down ×3, external/arrow-out ×2, menu ×2, upload ×2, file ×2. A weight or cap change in the token wouldn't reach them.

## Why now
The registry exists and is documented; the duplicates will only multiply. These files were mid-edit in other sessions when the registry landed, which is why the migration wasn't done in the same change.

## Success signal
`grep -rn "<svg" app --include='*.tsx'` returns only `Icon.tsx`, `TransportIcons.tsx`, `Chart.tsx`, `ResortAnatomy.tsx`, `MapCursor.tsx` and the season bar in `MapPreviewSidebar.tsx` (all drawings, not icons).

## In scope
| File | Inline glyphs → `Icon` name |
|---|---|
| `app/design-system/Nav.tsx` | MenuIcon → `menu`, CloseIcon → `close`, ExternalIcon → `external`, ChevronIcon → `chevron-down` (keep the rotate class) |
| `app/design-system/ThemeSwitcher.tsx` | sun / monitor / moon → `sun`, `monitor`, `moon` |
| `app/ui/mapbox/MapMenuSidebar.tsx` | ChevronDown / ChevronLeft / ChevronRight → `chevron-down`, `chevron-left`, `chevron-right` |
| `app/ui/mapbox/MapPreviewSidebar.tsx` | CloseIcon → `close`, ArrowOutIcon → `external` |
| `app/rentals/submit/FileDropZone.tsx` | UploadGlyph → `upload`, FileGlyph → `file` |
| `app/design-system/page.tsx` | nav specimen glyphs (menu/close/chevron at 2.4 stroke) → `Icon` at the token stroke; file/upload in the submit-form specimen → `file`, `upload` |

Keep each call site's size and any rotation/transition class; drop the local function. The nav specimen's heavier 2.4 stroke was a scale fudge — at the token stroke it should still read at 10px; if not, use `size={12}`.

## Out of scope
- Redrawing any glyph (shapes are already identical).
- Map-layer transport bitmaps (`TransportIcons.tsx` stays as the 16-grid source).

## Seats
- [ ] `/ux` — skipped: no behaviour change
- [ ] `/ui` — runs: swap, verify both themes, nav drawer open/close, theme switcher, file drop zone
- [ ] `/review-qa` — runs: grep above is the acceptance check; gate green
- [ ] `/security-ops` — runs: ships with the next release

## Links
- Chapter 18 · Iconography on `/design-system`
- `docs/reviews/iconography.md`
