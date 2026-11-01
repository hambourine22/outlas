# Review — Nav right-handed · 2026-10-31

**Slug:** `nav-right-handed` · **Brief:** `docs/briefs/nav-right-handed.md` · **Diff:** working tree, `app/design-system/Nav.tsx` only · **Reviewer:** `/review-qa`

## Verdict: ship

The three brief items are done, the drawer slides from the right at every breakpoint, GitHub + Live site live in a `LINKS` footer inside the drawer, and the nav-mark colour rule is preserved. The diff also quietly fixes one bug — the hamburger's `hover:bg-ink/5` (the Tailwind opacity trap that compiles to nothing with hex `--ink`) is now `hover:bg-[var(--row-hover)]`, so hover actually renders. Hand off to `/security-ops`.

## Gate
`qa-gate.sh` — typecheck ✓ · lint ✓ · tokens ✓ (LEGACY: 2 in `app/ui/sidebar.css`, pre-existing, unrelated) · build – skipped (SKIP_BUILD=1; dev server running on 3200, Vercel runs the full build on deploy).

## Acceptance criteria
Taken from `docs/briefs/nav-right-handed.md` → *In scope*:

- [x] **Hamburger moved from TopBar-left to TopBar-right (last in the right-hand stack)** — DOM-verified: right-hand `<nav>` renders `ThemeSwitcher` then `<button aria-controls="design-system-sidebar">`. Diff lines +118 to +126.
- [x] **GITHUB and LIVE SITE chips removed from TopBar** — grep `GitHub\|Live site` in `TopBar()` returns nothing; both now live only inside the drawer. Diff lines -119 to -134 (chips removed).
- [x] **Sidebar flipped: `right-0`, `border-l`, `translate-x-full` for hidden** — `className` string on `<aside>`: `fixed inset-y-0 right-0 … border-l border-rule … [open ? "translate-x-0" : "translate-x-full"]`. Diff lines +237 to +244.
- [x] **GITHUB + LIVE SITE as a utility group inside the drawer** — new `UtilityLinks` component renders a hairline-separated footer with "LINKS" label and two external links. Diff lines +190 to +218.
- [x] **Nav-mark colour rule intact** — `LogoMedallion` and the TopBar typemark `<Image>` blocks are byte-identical to pre-diff; both still use `theme-light-only` / `theme-dark-only` and the medallion comment restates the rule.
- [x] **`aria-controls` preserved** — the hamburger's `aria-controls="design-system-sidebar"` and the aside's `id="design-system-sidebar"` are both intact.

## Browser matrix
Verified in the browser (localhost:3200, HMR picked up changes from the running dev server):

| | Desktop (1440×900) | 375px phone |
|---|---|---|
| Light | ✓ wordmark pine · medallion pine · drawer snow · LINKS legible | ✓ |
| Dark | ✓ wordmark snow · medallion snow · drawer carbon · LINKS legible | ✓ |
| System (dark OS) | ✓ `data-theme` removed + emulated `prefers-color-scheme: dark` → third CSS block fires, all tokens flip | ✓ |

Hover ✓ — CSS verified below. Keyboard reaches the hamburger (`document.activeElement` lands on `button[aria-label="Open navigation"]`). Console clean (zero errors / hydration warnings on both routes).

## CSS verification (the single highest-value check)
Dispatched a stylesheet walk via `document.styleSheets` and inspected the hover rule for the new UtilityLinks rows:

```
.hover\:bg-\[var\(--row-hover\)\]:hover { background-color: var(--row-hover); }
```

That rule compiled. And `--row-hover` resolves per theme:

- Light: `rgb(30 30 30 / 0.07)` (carbon at 7%)
- Dark: `rgb(255 255 255 / 0.08)` (snow at 8%)
- System on dark OS: `rgb(255 255 255 / 0.08)` — the third `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) … }` block is present and firing.

The hover state will actually tint for real users. This is the trap that bit the earlier Sidebar hover work (`bg-ink/[0.05]` silently dropped by Tailwind because `--ink` is a hex, not an RGB triplet); the diff dodges it correctly for both the new rows and the hamburger button.

## Horizontal overflow check
At 375×812 with the drawer closed:
- `document.documentElement.scrollWidth === clientWidth === 375` → no overflow.
- Drawer rect: `x: 375, width: 288, right: 663` — the hidden drawer sits entirely outside the viewport right edge.
- Drawer transform: `matrix(1, 0, 0, 1, 288, 0)` (translate-x-full) applied correctly.

Why no `overflow-hidden` is needed here (unlike the recent MapPreviewSidebar fix): the main nav drawer is `fixed`, not `absolute`. Fixed-position descendants that extend past the viewport right edge don't extend their ancestor's scroll width in modern browsers. The map preview was `absolute inside relative`, which does extend. Different physics; the diff is correct.

## Findings
None at blocker, major or minor severity.

**[Nit] External link `rel` could be belt-and-braces** — `app/design-system/Nav.tsx:206`
`rel="noreferrer"` is sufficient in modern browsers (implies `noopener`), and the removed TopBar chips used the same single-value form, so this isn't a regression. If the project ever adopts `rel="noreferrer noopener"` as a convention, change both links in `UtilityLinks` to match — mention once, don't block.

## Noticed (outside this change)
- **Project-wide `:focus-visible` debt.** The only `:focus-visible` rules in the compiled stylesheet come from Mapbox GL CSS. None of this project's buttons or links define a focus ring, and Tailwind preflight neutralises the browser default. Keyboard users don't get a visible focus indicator on the hamburger, the SidebarItem rows, the new UtilityLinks rows, or (presumably) anywhere else in the app. This is not introduced by this diff — it predates it. Suggest an XS brief: *focus-visible — add a token-driven ring (`var(--accent)` at 2px) and apply via a shared utility class so every interactive element lights up when tabbed to.*
- **Tap targets under 44px.** Row buttons at `px-3 py-2 text-sm` compute to ~32–36px tall. Pre-existing SidebarItem pattern, now also in the new UtilityLinks rows. Suggest an XS brief: *tap targets — bump mobile row padding to `md:py-2 py-2.5` so phone taps clear 44px without changing desktop density.*

---

## Release — HELD on 2026-10-31

`/security-ops` ran preflight: RED on `pnpm audit` (Next 14.2.14 critical advisories, including the reachable AVIF RCE — GHSA-2xp9-vwfh-vxw4). Hamish's call: upgrade Next first.

Nav release is **held in the working tree** behind the Next upgrade. It stays staged for deploy on the next green preflight.

Next: `/factory` opens the line on [docs/briefs/next-upgrade-15.md](docs/briefs/next-upgrade-15.md). Nav deploys on the back of that release.
