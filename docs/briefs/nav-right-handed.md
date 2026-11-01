# Nav — right-handed sidebar + chips moved into the drawer

**Slug:** `nav-right-handed` · **Owner:** Hamish · **Opened:** 2026-10-31 · **Size:** S

## Problem
The TopBar's right-hand corner is competing for attention — the GITHUB → and LIVE SITE → chips sit next to the theme switcher, so the one control a user needs to notice (theme) is crowded. Meanwhile the hamburger lives in the top-left, so the main sidebar drawer swings in from the left even though every utility link the drawer should host is already parked on the right. The nav's handle and the nav's content are on opposite sides of the window.

## Why now
Hamish's request: *"Move all the links from the nav on the right hand side into the sidebar. Move the main nav to the right hand side."* It also aligns the main nav drawer with the Oütlas pattern — the medallion stays centred, the brand mark stays left, and controls (theme + nav handle) stack cleanly on the right.

## Success signal
The TopBar's right-hand corner contains only the theme switcher and a single hamburger. Clicking the hamburger slides the main sidebar drawer in from the right. GITHUB → and LIVE SITE → appear as rows inside that drawer, not in the TopBar.

## In scope
- `app/design-system/Nav.tsx` only.
- Move hamburger from TopBar-left to TopBar-right (last in the right-hand stack).
- Remove GITHUB and LIVE SITE chips from TopBar.
- Flip Sidebar drawer slide direction from left (`-translate-x-full`) to right (`translate-x-full`), swap `border-r` for `border-l`.
- Add GITHUB and LIVE SITE as a utility group inside the Sidebar drawer so they stay reachable from one place.
- Keep the nav-mark colour rule intact (typemark + medallion still match per [outlas-nav-mark-match](memory://outlas-nav-mark-match)).

## Out of scope
- No new chapters or routes.
- No change to `MapMenuSidebar` (left rail on the map page stays where it is — it's a page-local filter, not the main nav).
- No change to the pin preview sidebar (right rail on the map page).
- No new content, no copy rewrite beyond the two chip labels becoming rows.
- `aria-controls="design-system-sidebar"` stays as-is — it's the same drawer, just relocated.

## Seats
- [ ] `/ux` — skipped because the change restates existing patterns; no new acceptance criteria beyond "the handle and the drawer are now on the right."
- [ ] `/ui` — runs
- [ ] `/review-qa` — runs
- [ ] `/security-ops` — runs

## Links
- Current Nav: [app/design-system/Nav.tsx](app/design-system/Nav.tsx)
- Nav mark rule: `~/.claude/.../memory/outlas-nav-mark-match.md`
- Related: the map page's left MapMenuSidebar and right MapPreviewSidebar are untouched. The main nav drawer will temporarily co-reside on the right with the pin preview; main nav uses `z-30` same as before, preview uses `z-30` too — ordering by DOM, with the drawer backdrop closing both cleanly.

---

## UI note (seat: `/ui` · 2026-10-31)

### Structure chosen
- TopBar right-hand `<nav>` reordered as `ThemeSwitcher` → `hamburger`. Left-hand group reduced to the wordmark link + the `/design-system` chip.
- Sidebar `<aside>` flipped from `left-0 border-r -translate-x-full` to `right-0 border-l translate-x-full`. `aria-label` renamed from "Design system navigation" to "Primary navigation" since the drawer now hosts marketplace and system routes too, not just the Design System chapters.
- Added `<UtilityLinks />` as a hairline-separated footer section inside the drawer, below the groups loop. Rendered with the same row vocabulary as `SidebarItem` (font-ui text-sm · text-ink-muted · hover `--row-hover` · hover text-ink) so the two reach-points read as one surface. Each link gets an `ExternalIcon` (12px, 1.6 stroke) and `target="_blank" rel="noreferrer"`.
- Hamburger button hover changed from `bg-ink/5` to `bg-[var(--row-hover)]` — the former is the Tailwind opacity trap (hex `--ink` + `/α` compiles to nothing), and the new class matches the rest of the row-interaction vocabulary.

### Tokens added
- None. Scope was deliberately a reshape of existing primitives. The utility footer leans entirely on `--rule`, `--ink`, `--ink-muted`, `--ink-faint`, `--row-hover`, `.label`.

### Deviations from the brief
- None. Hamburger ends up as the last control in the right-hand stack (after ThemeSwitcher) rather than before it, which the brief anticipated.

### Specimen
- The Nav specimen chapter at `/design-system` (nav-component chapter) already shows the TopBar and Sidebar primitives — now reflects the right-handed layout automatically on next visit. No new specimen chapter needed for this reshape.

### Verification done
- `npx tsc --noEmit` clean.
- `node .claude/skills/review-qa/scripts/check-tokens.mjs` — PASS with 2 pre-existing LEGACY findings in retired `app/ui/sidebar.css` (nothing added).
- Browser matrix on `/` (map route) at 1440×900:
  - Light: wordmark pine, medallion pine, drawer snow panel, LINKS footer legible. ✓
  - Dark: wordmark snow, medallion snow, drawer carbon panel, LINKS footer legible. ✓
  - Drawer opens from the right with 200ms translate ease-out. ✓
  - Hamburger → × swap works; aria-expanded flips. ✓
- Nav-mark colour rule (medallion = typemark across themes) preserved — rule is cited in `LogoMedallion` comment and both assets still use `theme-light-only` / `theme-dark-only` utilities.

### What to look at
- The right-hand corner of the TopBar — one theme switcher + one hamburger, no chips.
- Open the drawer: scroll to the bottom and confirm the `LINKS` label + GitHub ↗ + Live site ↗ rows.
- Hover any utility row and confirm the `--row-hover` wash fires (same tint as the SidebarItem rows above).

Next: `/review-qa` on `nav-right-handed`.
