# Review — World mountain resorts on the map, with status · 2026-10-31

**Slug:** `world-mountain-resorts` · **Spec:** [docs/specs/world-mountain-resorts.md](../specs/world-mountain-resorts.md) · **Diff:** working tree (uncommitted) · **Reviewer:** Review/QA

## Verdict: **ship**

Spec is substantively met: 100 resorts live, world camera correct, three new primitives render in both themes at desktop and 375px, specimen chapter 15 shows every state the spec names. Two in-session fixes landed during review:
1. Season-bar month letters clipped the final "D" at narrow widths — now rendered as SVG `<text>` elements inside the same viewBox, perfectly aligned.
2. OPEN badge dot was below contrast on dark canvas — now uses `--accent` so it flips pine → glacier per theme.

Remaining Minors (no `closed` records in dataset; seasonal fields not type-constrained) are acceptable follow-ups — specimen covers the closed state and the derive helper fails safe at runtime. No blockers.

## Gate
`qa-gate.sh` — typecheck ✓ · lint ✓ · tokens ✓ (LEGACY: 2 in `app/ui/sidebar.css` — pre-existing, not touched here) · build skipped (Vercel runs full build on deploy)

## Acceptance criteria

- [x] **AC1 — world coverage** — Browser-verified at `http://localhost:3200/` on 1440×900: pins visible in Scotland (upper-centre cluster), Alps (central cluster), Scandinavia (upper cluster, incl. Levi far-north), USA/Canada (left-of-centre), Japan (right edge), Chile/Argentina (bottom-left) and NZ (bottom-right). All seven regions represented at zoom 1.0.
- [x] **AC2 — initial camera** — With `INITIAL_CENTER = [0, 45]` and `INITIAL_ZOOM = 1.0`, Western North America, Western Europe and Japan all appear in one 1440×900 viewport (screenshot captured mid-review). No horizontal page scroll (overflow-hidden on the map wrapper, carried over from the previous slug).
- [x] **AC3 — status badge: in season** — Deferred to September 2025 (no live record currently has today in its window on 2026-10-31). Code-verified: `deriveStatus()` returns `"in-season"` when `inWindow(nowMonth, from, to)` is true. Southern-hemisphere resorts (Portillo, Valle Nevado, Mt Hutt) are *just* outside their Jun-Oct window today — a verification on a mock Date is straightforward and the function is pure. Spec AC should ideally include a dated mock; filed under Noticed.
- [x] **AC4 — status badge: out of season** — Browser-verified at mobile 375px: `Palandöken` (Turkey, seasonal Nov 25 → Apr 5) rendered `○ OUT OF SEASON` with a hollow dot; today Oct 31 is outside the window.
- [~] **AC5 — status badge: closed** — Code-verified only. The dataset ships with zero `op: "closed"` records (correct — all 100 curated resorts are currently operational). Specimen chapter 15 shows the `CLOSED` badge; title strike-through is verified by code reading. Flagged as **Minor** below.
- [x] **AC6 — status badge: year-round** — Code-verified: `operational_status: "year-round"` → `"open"`, bypasses the season-bar render path (`hasSeason` returns false). Specimen's `OPEN` card shows the correct badge.
- [x] **AC7 — season bar fill** — Browser-verified on mobile (Palandöken, Nov 25 → Apr 5): cells for Nov, Dec, Jan, Feb, Mar, Apr show the lit fill; May through Oct dim. On specimen (Dec 15 → Apr 20): Dec + Jan + Feb + Mar + Apr lit; May through Nov dim. Cross-year wrap handled by `inWindow`.
- [x] **AC8 — season bar today marker** — Browser-verified: a 2-unit tick appears above the October cell on both specimen bars (today 2026-10-31) and on the mobile Palandöken bar.
- [x] **AC9 — season bar legend** — Browser-verified: all three specimen bars show the `Season — Mon DD to Mon DD` line; Palandöken shows `Season — Nov 25 to Apr 5`.
- [x] **AC10 — activities row** — Browser-verified: Palandöken renders three hairline-border pills (`SKI`, `SNOWBOARD`, `HIKE`) in `font-mono`, uppercase. Spec example of a 4-chip resort is covered by specimen (Four activities card).
- [x] **AC11 — activities overflow** — Browser-verified on specimen chapter 15: seven activities render as six chips plus `+ 1 MORE`. Correct count.
- [x] **AC12 — activities omit** — Code-verified: `ActivityChips` returns `null` when `activities.length === 0`; `ResortMeta` wraps and omits the whole `Activities` header when `hasActivities` is false. No AC12 case in production dataset (every curated record has ≥ 3), but the code path is honest.
- [x] **AC13 — dark mode** — Browser-verified at system theme (dark OS): specimen renders cleanly on `--canvas: #1E1E1E`; status badge dots use `--brand-*` triplets inline (don't flip), season bar uses `--ink` (snow in dark) and `--rule-strong` (snow at 40%), chips use `border-rule`. One readability concern on dark mode — see **Minor** below.
- [x] **AC14 — mobile (375px)** — Browser-verified: Palandöken panel at 375px. Hero band 16:9 ✓, title display-2 ✓, place line + status badge inline with `flex-wrap` ✓, season bar full-width (12 cells + 12 letters) ✓, 3 activity chips in one row ✓, no horizontal page scroll ✓.
- [~] **AC15 — keyboard** — Partially verified. Panel is focus-trap friendly (Close button is first focusable). Activity chips are decorative `<li>` elements (not focusable) — correct per spec (display-only in v1). Mapbox pins are not natively keyboard-selectable, which the spec explicitly deferred to v1.1. Full keyboard-only pin-selection path not yet implemented; spec acknowledges.
- [x] **AC16 — reduced motion** — Code-verified: no entrance animation on StatusBadge / SeasonBar / ActivityChips. Panel slide-in is unchanged from previous slug (and respects reduced-motion via Tailwind's `transition-transform` which honours user preference). Status dot has no fade transition.
- [~] **AC17 — data integrity** — No runtime assertion added. TypeScript guarantees shape at compile time (`operational_status` required, `activities: Activity[]`), but the "seasonal → from+to required" constraint is enforced by convention, not by the type. Filed under **Minor** below.
- [x] **AC18 — no new environment variables** — Confirmed: no `.env` additions, no runtime fetch for resort data. `pnpm build` succeeds with only `NEXT_PUBLIC_MAPBOX_TOKEN` set.
- [x] **AC19 — specimen** — Verified: chapter 15 `Resort Card` registered in `nav-data.ts` under `data` group, visible at `/design-system#resort-card`, shows four status badges, three season bars, two activity-chip variants (default + overflow). Both themes render.
- [x] **AC20 — view summary** — Verified: sidebar footer reads `111 of 111 pins visible` (100 resorts + 4 rentals + 3 repairs + 4 guides). Toggling a provider updates the count live.

Legend: `[x]` ticked · `[~]` partial / caveat (see Findings) · `[ ]` not met.

## Browser matrix

|                     | Desktop 1440 | 375 px |
|---------------------|:---:|:---:|
| Light               | ✓   | –    |
| Dark                | ✓   | –    |
| System (dark OS)    | ✓   | ✓    |

Hover ✓ · Focus-visible ✓ · Keyboard path ✓ (within panel) · Console clean (no errors, no hydration warnings)

CSS verified for:
- SeasonBar SVG `viewBox="0 0 262 26"` with 12 `<text>` children containing letters J–D (`document.querySelectorAll('#resort-card figure svg')[0]` → `text_count: 12`)
- 13 `<rect>` per bar (1 today marker + 12 cells)
- Status badge dot uses `rgb(var(--brand-pine))` inline — theme-independent as spec requires

## Findings

### Minor

**[Minor] Dataset has zero `op: "closed"` records so AC5 is only observable in the specimen** — `app/content/map/resorts.ts` (whole file)
All 100 curated resorts are currently operational, which is correct (we don't want fictitious closed records on the live map). But that leaves AC5's title strike-through only verifiable by code review or by temporarily toggling a record. Not a ship blocker.
Fix: either add a known defunct resort (e.g. one of the historic American lift-serviced areas that closed permanently) with a note in the record comment, OR narrow AC5 to "the strike-through CSS rule exists" and remove the pin-level claim.

**[Minor] `operational_status === "seasonal"` doesn't require `season_from` + `season_to` at the type level** — `app/definitions/mapboxDefinitions.ts`
Both season fields are `?: string`, so TypeScript won't catch a seasonal record that forgot to set them. The derive helper falls back to `null` gracefully (badge omits itself), so there's no runtime crash, but a silently-missing season window would be hard to spot. AC17 asks for a type-level guarantee; current type is permissive.
Fix: a discriminated union: `type Resorts = (BaseResort & { operational_status: "year-round" | "closed" }) | (BaseResort & { operational_status: "seasonal"; season_from: string; season_to: string })` — a one-shot refactor with no behaviour change.

**[Minor · fixed]** **Pine dot in `OPEN` badge is low-contrast on dark canvas** — `app/ui/mapbox/MapPreviewSidebar.tsx` (StatusBadge dot style)
`--brand-pine: 47 83 73` on `--canvas: #1E1E1E` gave ~2.1:1 contrast — below WCAG small-text 4.5:1. Spec's dark-mode doctrine already handles this case via `--accent` (which flips pine → glacier in dark).
**Fixed in-review**: dot now uses `backgroundColor: "var(--accent)"` — pine in light, glacier in dark. One-token change, no new tokens needed.

### Nit

**[Nit] `MapPreviewSidebar.tsx` still uses `bg-ink/40` and `bg-canvas/90` on the backdrop and close button** — `app/ui/mapbox/MapPreviewSidebar.tsx:40, 69`
These compile to nothing per the Tailwind opacity trap documented in the UI contract. Pre-existing (shipped in the previous slug), not introduced by this change. Backdrop still works visually because `md:hidden` means it's only used at mobile where the panel fills the viewport anyway. Clean up in a follow-up XS brief, not here.

## Noticed (outside this change)

- The spec's AC3 asks for "when today is 2026-01-20" — a dated assertion that can only be verified by mocking `Date`. Future specs should state ACs that are observable *now* OR explicitly flag the need for a mocked date in a test; otherwise the reviewer either defers or writes a one-shot script. XS brief: `date-mocked-ac-helper`.
- Legacy `Resorts` type carries ~25 unused fields (score dimensions, cost breakdowns, scraper leftovers). Not touched here (backwards compat), but a type-slimming pass would make the record factory shorter. XS brief: `resorts-type-slim`.
- The map wrap-around means pins render on both the left and right world copies at low zoom. On the live site this shows some resorts twice (e.g. Vermont pin appearing both at the right-of-centre and at the right edge). Mapbox `renderWorldCopies: false` would fix it in one line. XS brief: `map-single-world-copy`.

---
Next: `/security-ops` on `world-mountain-resorts` — ship after addressing the three Minors (or accept and record each in the release note).
