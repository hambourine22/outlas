# Component checklist — paste into the `## UI note` and tick

Everything here is a question review will ask. Ticking it yourself first turns a two-round review into one.

## Structure
- [ ] Read the spec; every state it lists (default, hover, active, focus, empty, loading, error, narrow) has a home in the component
- [ ] Composed from existing primitives where possible (`Nav`, `Chart`, `.chip`, `.label`, `.micro`, score pills, legend) — new primitive justified in one line
- [ ] Server component unless it needs state/browser APIs; `"use client"` only on the leaf that needs it
- [ ] Content comes through `app/content/*` facades, never from a backend or a hard-coded array in the component

## Tokens
- [ ] No hex, no `gray-*`, no `black/50`, no `opacity-*` on coloured elements — every colour is a semantic token or a surface
- [ ] No `bg-ink/[α]` / `text-ink/α` style classes (they compile to nothing here); alpha lives in a variable, bound with `bg-[var(--x)]`
- [ ] Any new token is in `design-system.ts` + `globals.css` (×3 theme blocks) + `tailwind.config.ts`
- [ ] `node .claude/skills/review-qa/scripts/check-tokens.mjs` passes

## Themes
- [ ] Light ✓ · Dark ✓ · **System on a dark OS** ✓ (emulate `prefers-color-scheme: dark` with no `data-theme`)
- [ ] Paired assets use `.theme-light-only` / `.theme-dark-only`, not `dark:`
- [ ] Medallion and typemark are the same colour in each theme (pine / snow)
- [ ] Surfaces (`data-surface`) look identical in both modes

## Layout
- [ ] Every spacing value on the ladder (multiples of 4) — no `p-5`, `gap-7`, `mt-[18px]`
- [ ] Radii ≤ `md` (6px) unless it's a status chip or score pill
- [ ] Hairline rules for separation; no `shadow-*` unless it's a modal sheet
- [ ] 375px: no horizontal scroll, tap targets ≥ 44px, labels don't wrap into three lines
- [ ] Sticky TopBar accounted for (`scroll-padding-top: 56px` already in `html`; anchors land below the bar)

## Type
- [ ] Editorial text in Vollkorn; UI chrome in Archivo Narrow via `.font-ui` / `.label` / `.micro`
- [ ] Labels ≤ 2 words; no sentence-case button text in `.label`
- [ ] Type rungs from the scale (`text-display-2`, `text-title`, `text-body`…) — no ad-hoc `text-[17px]`

## Accessibility
- [ ] Interactive = `<button>` or `<a>`, never a `<div onClick>`
- [ ] State that isn't visible is announced: `aria-expanded` + `aria-controls` on disclosures, `aria-current="page"` on active nav, `role="radiogroup"` / `aria-checked` on segmented controls
- [ ] Icon-only buttons have `aria-label` + `title`; decorative SVGs have `aria-hidden`
- [ ] Visible focus ring on every control in both themes (check dark — a carbon ring on carbon is invisible)
- [ ] Body text ≥ 4.5:1, large text ≥ 3:1 against its canvas — `--ink-faint` (35%) is below 4.5:1 on both canvases, so it's for decoration and inactive items, not body copy
- [ ] Motion respects `prefers-reduced-motion` (transitions are fine; movement that conveys meaning needs a static fallback)

## Images
- [ ] `next/image` with the asset's real dimensions (Ü-mark 904×1314, logotype 2213×478) so aspect ratio is locked and there's no CLS
- [ ] `alt` that says what it is ("Oütlas") or `alt=""` + `aria-hidden` when decorative next to text that already says it

## Specimen
- [ ] New component/pattern has a chapter in `app/design-system/page.tsx`, registered in `nav-data.ts`
- [ ] Specimen shows every state; shows both themes where they differ
- [ ] The behaviour table / notes in the chapter match what was built

## Verification done
- [ ] Dev server on :3200, checked in the browser at desktop and phone widths
- [ ] For each hover/active/focus claim: the compiled CSS rule exists (`document.styleSheets` search or `getComputedStyle` after a synthetic event)
- [ ] No console errors or hydration warnings

## Handoff
- [ ] `## UI note` appended to `docs/specs/<slug>.md`: structure, tokens added, deviations (if any) and why, where to look in the specimen
- [ ] Commit message in `Area: imperative summary` form
- [ ] Ends with `Next: /review-qa on <slug>`
