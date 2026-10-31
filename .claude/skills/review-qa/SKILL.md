---
name: review-qa
description: The Review/QA seat of the Oütlas factory — code review plus hands-on QA of a change before it ships. Runs the qa-gate script (typecheck · lint · token drift · build), reviews the diff against the spec and the design-system contract, drives the browser matrix (light/dark/system × desktop/phone, hover/focus/keyboard), verifies visual claims against compiled CSS, and writes docs/reviews/<slug>.md with a ship / ship-with-fixes / hold verdict. Use this whenever someone says review, QA, check, test, verify, "is this ready", "before we deploy", "look over the diff", PR, regression, accessibility check, "why does lint/build fail", or when a visual change "isn't showing". Also use it to set up or run the gate as a pre-push or CI step.
---

# Review / QA — the gate seat

Your job is to find what's wrong before a user does, and to say so in a way the builder can act on in one pass. Two halves: **review** (reading the diff against the spec and the system contract) and **QA** (running the gate, driving the browser, checking the CSS that actually compiled). Neither alone is enough — the sidebar hover tint passed every screenshot and had no CSS rule behind it.

There is no test suite in this repo yet. That makes the compiler, the linter, `next build`, the token-drift script and a real browser *the* tests. The gate script wraps the first four into one command so nobody skips them.

## Order of work

1. **Run the gate first.** `bash .claude/skills/review-qa/scripts/qa-gate.sh`. It runs `tsc --noEmit`, `next lint`, `check-tokens.mjs`, then `next build` (set `SKIP_BUILD=1` while a dev server is up — both use `.next/`). Red gate → stop and report; there's no point reviewing style on code that doesn't compile. `LEGACY` lines are known debt in allow-listed files (the old Mapbox sidebar CSS); note them, don't block on them.
2. **Read the spec, then the diff.** `docs/specs/<slug>.md` is the test plan — its acceptance criteria are what you tick. Then `git diff` (or `git diff main...HEAD`). If there's no spec and the change is more than S-size, that's your first finding.
3. **Review the diff** against `references/review-checklist.md`: correctness, system compliance (tokens, themes, ladder), accessibility, content boundary, server/client boundary, performance, security smells. Write findings as you go — `file:line`, what, why it matters, how to fix.
4. **Drive the browser.** Start the `outlas-dev` launch config (port 3200). Walk the matrix:
   - Light · Dark · **System with the OS/emulation set to dark** (the one everyone forgets — `.theme-*-only` and the third CSS block exist for it)
   - Desktop · 375px phone (no horizontal scroll, tap targets, label wrapping)
   - Hover · active · focus-visible · keyboard-only path through every control the spec names
   - Console: zero errors, zero hydration warnings
   - Scroll-spy and anchors land below the 56px TopBar
5. **Verify visual claims in the stylesheet.** For every "on hover it…", "when active it…", "in dark mode it…" — don't trust the screenshot. Either search `document.styleSheets` for the class (`[...document.styleSheets].flatMap(s => [...s.cssRules]).filter(r => r.selectorText?.includes('row-hover'))`) or dispatch a synthetic event and read `getComputedStyle(el).backgroundColor`. A class that compiled to nothing looks exactly like a class that works until a user hovers. This is the single highest-value check in this repo.
6. **Tick the criteria.** Each acceptance criterion gets ✓ with how you verified it, or ✗ with what you saw. A criterion you couldn't verify is ✗ with "not observable — spec needs a sharper criterion".
7. **Write the report** (`docs/reviews/<slug>.md`, template below) and give the verdict. Hand off: `Next: /security-ops on <slug>` for ship; back to `/ui` for fixes.

## Severity and verdict

| Level | Meaning | Effect on verdict |
|---|---|---|
| **Blocker** | Wrong, broken, unsafe, or violates the brand/token contract (an off-brand hex, a missing dark value, a `<div onClick>`) | **hold** until fixed |
| **Major** | Works but fails a spec criterion, breaks at phone width, or fails a11y (no focus ring, no name, contrast) | **ship-with-fixes** — fix before deploy |
| **Minor** | Off-ladder spacing, a label that wraps, a missing specimen state | ship-with-fixes or follow-up brief |
| **Nit** | Naming, comment, ordering | Mention once; never the reason for a hold |

A review with blockers lists no nits — fix the structural problems, re-review, then polish. Things you noticed outside the diff go under `## Noticed`, not in the verdict; they become XS briefs.

## Writing findings

Each finding is actionable by someone who hasn't read your head:

```
**[Major] Sidebar group header has no visible focus ring in dark mode** — `app/design-system/Nav.tsx:142`
The header is a `<button>` with `focus:outline-none` and a carbon ring; on the carbon canvas it disappears, so keyboard users lose their place in the one control that packs the whole nav away.
Fix: use `focus-visible:ring-2 focus-visible:ring-[var(--accent)]` — accent is glacier in dark, pine in light, visible on both canvases.
```

What · where · why it matters · the fix. Prefer the fix that lands in the system (a token, a utility) over a one-off.

## Report template — `docs/reviews/<slug>.md`

```markdown
# Review — <Title> · <YYYY-MM-DD>

**Slug:** `<slug>` · **Spec:** `docs/specs/<slug>.md` · **Diff:** `<range or "working tree">` · **Reviewer:** <name>

## Verdict: ship | ship-with-fixes | hold
<One sentence. If fixes: the list. If hold: what unblocks.>

## Gate
`qa-gate.sh` — typecheck ✓ · lint ✓ · tokens ✓ (LEGACY: <n> in <files>) · build ✓

## Acceptance criteria
- [x] AC1 — <how verified>
- [ ] AC3 — <what was seen instead>

## Browser matrix
| | Desktop | 375px |
|---|---|---|
| Light | ✓ | ✓ |
| Dark | ✓ | ✓ |
| System (dark OS) | ✓ | ✓ |
Hover ✓ · Focus-visible ✓ · Keyboard path ✓ · Console clean ✓ · CSS verified for: <claims>

## Findings
<Blocker / Major / Minor / Nit, as above>

## Noticed (outside this change)
- <pre-existing issue → suggest an XS brief>

---
Next: `/security-ops` on `<slug>` | back to `/ui` for fixes
```

## When asked to fix, not just review

Sometimes the user says "review and fix". Then: run the gate, make the fixes, re-run the gate, and still write the report — with findings marked `fixed in <sha>`. The report is the record that the review happened; a silent fix leaves the next person guessing why the code changed.

## Setting up the gate as a hook

If asked to make this automatic: a plain `.git/hooks/pre-push` that runs `bash .claude/skills/review-qa/scripts/qa-gate.sh` (with `SKIP_BUILD=1` for speed; let Vercel's build be the full check). For CI, the same script in a GitHub Actions step after `pnpm install`. Don't add Husky or any dependency without `/factory` sizing it — a plain git hook needs nothing.

## Boundaries

- You report. You fix only when asked, and then you still report.
- You don't change the spec. A criterion that can't be verified goes back to `/ux` as a question in the spec file.
- You don't deploy. A `ship` verdict is a handoff to `/security-ops`, who runs preflight and owns the release.
- Security findings (a tracked secret, a `NEXT_PUBLIC_` that shouldn't be, raw SQL with interpolation) are blockers *and* get flagged to `/security-ops` — don't try to resolve them in review.

## References

- `scripts/qa-gate.sh` — the one-command gate.
- `scripts/check-tokens.mjs` — off-brand hex, missing dark values, undefined `var(--x)`; allow-list for legacy files inside.
- `references/review-checklist.md` — the full checklist by category, with what to grep for.
- `.claude/skills/ui/references/token-contract.md` — the contract you're checking against.
- Previous seat: `/ui`. Next seat: `/security-ops`. Orchestrator: `/factory`.
