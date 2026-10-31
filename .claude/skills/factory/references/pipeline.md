# Pipeline — stage contracts

Each stage has an input, an output file, and gate questions. A stage is complete when a second person can answer every gate question "yes" by reading the output file and, where noted, running a script — without re-doing the work.

The slug is the thread. Derive it from the brief title (kebab-case, ≤ 4 words: `guides-legend`, `rental-cta-sheet`) and reuse it unchanged for every file on the trail, so `ls docs/*/guides-legend*` shows the whole history.

---

## Stage 0 — Intake (`/factory`)

**Input:** the request as given (chat, ticket, screenshot, Slack message), plus `git log --oneline -10` and a glance at existing briefs.

**Output:** `docs/briefs/<slug>.md` (template in `templates.md`).

**Gate questions**
- Who owns this and who is it for?
- What is the one-sentence success signal — what will be observably different when it's live?
- What's explicitly out of scope?
- What size is it, and which seats run?

**Etiquette:** a brief is a screen long. If it wants to be longer, it's two briefs.

---

## Stage 1 — Spec (`/ux`)

**Input:** the brief; `app/design-system/nav-data.ts` (what chapters exist); `app/content/stories/registry.ts` and `app/content/map/*.ts` (what content exists); the live `/design-system` page for current patterns.

**Output:** `docs/specs/<slug>.md` (template in the `/ux` skill).

**Gate questions**
- Is every acceptance criterion Given/When/Then and checkable in a browser or by a script?
- Are primary path, empty state, error state and loading state all described?
- Is the copy real — in the Oütlas voice — with no placeholder text?
- Are accessibility requirements stated (keyboard path, focus order, labels, contrast class)?
- Does the spec name UX moments (`data-surface`), components and behaviours — and leave colours, spacing and type to the system?

**Etiquette:** if the brief is ambiguous, ask at most three questions, then write the spec with stated assumptions ranked by confidence. Don't block on a fourth question — the UI seat can push back by appending `## Questions`.

---

## Stage 2 — Build (`/ui`)

**Input:** the spec; `app/lib/design-system.ts`, `app/globals.css`, `tailwind.config.ts` (the token contract); existing primitives in `app/design-system/` (Nav, Chart, ThemeSwitcher) and utilities (`.label`, `.micro`, `.chip`).

**Output:** code; a specimen chapter in `app/design-system/page.tsx` registered in `nav-data.ts` when a new component or pattern is introduced; a `## UI note` appended to the spec recording decisions and any deviation from the spec.

**Gate questions**
- Does every colour resolve to one of the six brand hexes, via a semantic token (`--canvas`, `--ink`, `--accent`, `--rule`, `--row-hover`…)? Run `node .claude/skills/review-qa/scripts/check-tokens.mjs` to be sure.
- Is any new token present in all three files, with light, `[data-theme="dark"]` and `prefers-color-scheme: dark` values?
- Does it hold in light, dark *and* system mode (system on a dark OS is the one people forget)?
- Does it hold at phone width (≤ 640) with no horizontal scroll?
- Is it on the Power-of-4 ladder — spacing, radii, type rungs — and does it use hairline rules rather than shadows?
- Is there a specimen a reviewer can look at without reading code?

**Etiquette:** UI doesn't silently change acceptance criteria. If a criterion can't be met within the system, append to the spec and flag it to UX. If the system lacks a token or primitive, add it *to the system* (all three files + a specimen), not inline.

---

## Stage 3 — Review / QA (`/review-qa`)

**Input:** the spec (criteria are the test plan) and the diff (`git diff main...HEAD` or the uncommitted tree).

**Output:** `docs/reviews/<slug>.md` with a verdict; `qa-gate.sh` green.

**Gate questions**
- Does `bash .claude/skills/review-qa/scripts/qa-gate.sh` exit 0? (typecheck · lint · token drift · build)
- Is each acceptance criterion ticked, with how it was verified?
- Browser matrix done: light / dark / system × desktop / phone, hover / focus / keyboard, no console errors?
- For any visual claim ("the tint shows on hover"), was the compiled CSS or `getComputedStyle` checked, not just a screenshot?
- Are findings ranked blocker / major / minor / nit, each with `file:line`, what, why, fix?
- Is the verdict one of **ship**, **ship-with-fixes** (list them), **hold** (say what unblocks)?

**Etiquette:** QA reports; it only fixes when asked. A review with blockers lists no nits — fix the blockers first, re-review, then polish. Pre-existing issues outside the diff go in a `## Noticed` section, not in the verdict.

---

## Stage 4 — Release (`/security-ops`)

**Input:** a `ship` or `ship-with-fixes` verdict with fixes applied; a clean working tree on `main`.

**Output:** `preflight.sh` green; production deploy of `outlas-ds`; `docs/releases/<YYYY-MM-DD>-<slug>.md`.

**Gate questions**
- Does `bash .claude/skills/security-ops/scripts/preflight.sh` exit 0? (no tracked secrets, env hygiene, dependency audit, no stray `dangerouslySetInnerHTML`, build artefacts untracked)
- Are any new env vars set in Vercel for production (and preview if relevant) *before* deploying, and is nothing sensitive prefixed `NEXT_PUBLIC_`?
- Does `curl -sI https://outlas-ds.vercel.app/<route>` return 200 for every route touched?
- Browser smoke test on the live URL in both themes?
- Does the release note name the commit SHA, the live URL, what changed, and the rollback command?

**Etiquette:** roll back first, debug second. If the live check fails, `vercel rollback` (or promote the previous deployment) within ten minutes, then investigate. Never deploy a red gate; record `LEGACY` findings in the release note.

---

## Stage 5 — Learn (`/factory`)

**Input:** the four trail files.

**Output:** 1–3 lines appended to `docs/learnings.md` (format in `templates.md`).

**Gate question:** would the next person on a similar change be faster for having read it? If it's a restatement of what shipped, it isn't a learning — the release note has that.

---

## Handoff etiquette (all stages)

- **Read upstream first.** Open the previous stage's file before doing anything.
- **Push back in the file.** Append `## Questions` to the upstream file; don't guess and don't ask only in chat.
- **Append, don't rewrite.** Upstream files are a record. UI adds `## UI note`; QA adds nothing to the spec but ticks criteria in its own report.
- **Name the next seat.** End every stage with "Next: `/ui` on `<slug>`" so the trail is self-navigating.
- **Stay in your lane.** The role boundaries in `SKILL.md` exist so that disagreements surface as questions in files rather than as silent overrides in code.
