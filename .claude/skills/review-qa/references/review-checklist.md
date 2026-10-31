# Review checklist

> **`qa-gate.sh` now runs `next build` in an rsync'd copy of the working tree by default**, so a running dev server holding `.next/` is no longer a reason to skip. Prerender-time errors (notably: React 19 hooks like `useActionState` imported in a Next 14 / React 18 project) now surface in the gate, not for the first time on Vercel. `SKIP_BUILD=1` still works as an explicit opt-out — if you use it, say so in the review report. The release-worktree build in `/security-ops` then becomes the first full build. See `docs/learnings.md` 2026-10-31 · `guides-apply-form` + `map-pin-rings release`.


Work through each category against the diff. The `grep` hints are starting points, not proof — read the code around every hit.

## 1. Correctness
- Does it do what the spec's acceptance criteria say — all of them, including empty / error / narrow states?
- State that should persist (theme) uses `localStorage` under `outlas:theme` with try/catch; state that shouldn't (sidebar expansion) doesn't.
- Hooks: effects have the dependencies they need (`react-hooks/exhaustive-deps` is **off** in `.eslintrc.json`, so the linter won't catch a stale closure — you must).
- IntersectionObserver / scroll-spy: observers are disconnected on unmount; the sticky 56px TopBar is accounted for in `rootMargin`.
- Server/client boundary: `"use client"` only where state, effects or browser APIs are used; no `window`/`localStorage` access in a server component or at module top-level in a client one (hydration mismatch).
- `suppressHydrationWarning` only on `<html>` for the theme attribute — anywhere else it's hiding a bug.

## 2. Design-system contract
- Colours: `grep -nE '#[0-9A-Fa-f]{3,6}\b|gray-|black/|white/|zinc-|slate-|neutral-' <files>` → every hit is a finding unless it's one of the six brand hexes in a token file.
- Opacity classes on semantic colours: `grep -nE '\b(bg|text|border|ring)-(ink|canvas|rule|accent)[a-z-]*/' <files>` → each compiles to nothing (hex vars). Blocker.
- New tokens present in all three files, three theme blocks — `node .claude/skills/review-qa/scripts/check-tokens.mjs` checks the CSS side.
- Spacing on the ladder: `grep -nE '\b(p|m|gap|space-[xy]|inset|top|left|right|bottom)[trblxy]?-(5|7|9|11|13|14|15|\[[0-9]+px\])\b'` → off-ladder.
- Radii: `grep -nE 'rounded-(lg|xl|2xl|3xl|full)'` → only `rounded-pill`/`rounded-chip` on chips and pills; otherwise ≤ `rounded-md`.
- Shadows: `grep -n 'shadow-'` → modal only.
- Fonts: editorial in Vollkorn (default), chrome in `.font-ui` / `.label` / `.micro`; `grep -n 'font-sans'` is a smell (Tailwind's default sans isn't Archivo unless aliased).
- Theme-paired assets use `.theme-light-only` / `.theme-dark-only`, not `dark:` (`grep -n 'dark:hidden\|dark:block'`).
- Medallion + typemark same colour per theme.

## 3. Accessibility
- Interactive elements: `grep -nE '<(div|span)[^>]*onClick'` → blocker.
- Disclosures: `aria-expanded` + `aria-controls` + matching `id`; chevron is `aria-hidden`.
- Nav: `aria-current="page"` on the active item; `<nav aria-label>` when there's more than one nav.
- Segmented controls: `role="radiogroup"` + `role="radio"` + `aria-checked`, or real radios.
- Icon-only buttons: `aria-label` and `title`; decorative SVG `aria-hidden`.
- Focus: `grep -n 'outline-none\|focus:outline-none'` → must be paired with a `focus-visible:` ring that's visible on *both* canvases (accent works: pine on snow, glacier on carbon).
- Contrast: body text in `--ink` or `--ink-muted` (60% ≈ 5.5:1 on both canvases — OK); `--ink-faint` (35%) fails 4.5:1 — decoration and inactive only.
- Images: `next/image` with real dimensions; `alt` meaningful or `""` when decorative.
- Motion: anything that moves meaningfully has a `motion-reduce:` fallback.
- Keyboard: Tab reaches everything in a sensible order; Escape closes drawers; focus returns to the trigger.

## 4. Content & data boundary
- Pages import from `app/content/*` facades, never from `app/lib/data.ts` directly and never from a hard-coded array in a component (`grep -rn "lib/data" app --include=page.tsx`).
- Content records are typed; no `as any`, no `// @ts-ignore` to make a record fit (`grep -n 'as any\|ts-ignore\|ts-expect-error'`).
- Copy is real and in the voice — no `lorem`, `TODO`, `TBD`, `Oops`.
- Stories: a new story is a row in `stories/registry.ts` *and* a page under `app/stories/<slug>/`; the index and sidebar derive from the registry.

## 5. Performance
- `next/image` for raster assets; no `<img>` (`grep -n '<img'`).
- No new runtime dependency without a `/factory` decision (`git diff package.json`).
- No network font calls (`grep -n 'fonts.googleapis'`).
- Client components don't import server-only modules (`@vercel/postgres`) — build would fail, but check.
- Heavy work (map) is behind a dynamic import or a client boundary that doesn't block the shell.

## 6. Security smells (flag to `/security-ops`, don't resolve in review)
- `grep -n 'dangerouslySetInnerHTML'` → only the theme bootstrap in `app/layout.tsx` is sanctioned (static string, no user input).
- `grep -nE 'NEXT_PUBLIC_[A-Z_]*(SECRET|KEY|PASSWORD|URL|POSTGRES|DATABASE)'` → `NEXT_PUBLIC_MAPBOX_TOKEN` is the one intentional public token (URL-restricted in Mapbox); anything else is a blocker.
- SQL: `app/lib/data.ts` uses string literals today; any template literal with `${…}` inside `sql.query(...)` is a blocker — use parameterised queries (`sql\`SELECT … WHERE id = ${id}\`` tagged template is parameterised; `sql.query(\`… ${id}\`)` is not).
- New `fetch` to a third party: where does the key live, and is the response typed and validated?
- Files: nothing under `.env*`, `.vercel/`, `.next/` in the diff (`git diff --name-only | grep -E '^\.(env|vercel|next)'`).

## 7. Specimen & docs
- New component or pattern has a chapter in `app/design-system/page.tsx` and an entry in `nav-data.ts`.
- The chapter's behaviour table matches the code (e.g. no row describing a breakpoint behaviour that was removed).
- `docs/DESIGN_SYSTEM.md` updated if a rule changed (not for every component).
- Spec has a `## UI note`; deviations are called out, not buried.

## 8. Commit hygiene
- Message in `Area: imperative summary` form.
- One slug per commit series; no drive-by fixes folded in (those are XS briefs).
- No generated files (`tsconfig.tsbuildinfo`, `.next/`) staged.
