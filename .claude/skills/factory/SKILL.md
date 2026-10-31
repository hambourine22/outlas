---
name: factory
description: The Oütlas software factory — the orchestrating skill that routes a change through four role gates (UX spec → UI build → Review/QA → Security/Ops release) with file-based handoffs in docs/. Use this whenever someone asks to "ship", "build", "deliver", "take this end-to-end", "run the factory", "plan this feature", "what's the process", or brings a brief, feature, bug or redesign that will touch more than one seat. Also use it when a request arrives with no acceptance criteria, when someone asks which role skill to use next, where a handoff file lives, how big a change is, or whether something is "done". Even for a small change, consult it to pick the minimum set of gates instead of jumping straight to code.
---

# Factory — orchestrator

The factory is a repeatable line: a brief goes in one end, a verified live release comes out the other, and every seat on the line leaves a file behind that the next seat reads first. Roles are skills (`/ux`, `/ui`, `/review-qa`, `/security-ops`); handoffs are files in `docs/`; gates are checklists a second person can verify without re-doing the work.

```
Brief ──▶ /ux ──▶ /ui ──▶ /review-qa ──▶ /security-ops ──▶ Live ──▶ Learn
docs/briefs  docs/specs  code+specimen  docs/reviews   docs/releases   docs/learnings.md
```

Why files and not chat: this team works across sessions, forks and people. A spec that lives only in a conversation is gone when the context is. A spec in `docs/specs/` is read by the next seat, diffed in review, and cited in the release note.

## When you are invoked

1. **Read what exists.** `ls docs/briefs docs/specs docs/reviews docs/releases 2>/dev/null` and `git log --oneline -10`. If the request already has a slug trail, pick it up where it stopped — don't restart the line.
2. **Write or confirm the brief.** If there's no `docs/briefs/<slug>.md`, write one from the request using the template in `references/templates.md`. Keep it to a screen. The brief's job is to make "done" unambiguous, not to design anything.
3. **Size it and pick the gates.** Use the sizing table below. Say which seats run and which are skipped, and why. Skipping a gate is a decision that goes in the brief, not a silent omission.
4. **Hand to the first seat.** Either invoke the role skill yourself (sequential mode) or tell the user which `/command` to run in which session (team mode). In team mode, each seat is its own session or person; you only coordinate.
5. **Close the loop.** When Security/Ops reports live, confirm the release note exists, append the learning, and summarise the trail: four file paths and the commit SHA.

## Sizing → which gates run

| Size | Typical change | Seats | Why |
|---|---|---|---|
| **XS** | Copy, typo, token value nudge, doc edit | `/review-qa` (gate script only) → `/security-ops` (preflight + deploy) | Nothing to design; still verify it builds and ships clean. |
| **S** | One component tweak, hover/active state, icon swap | `/ui` → `/review-qa` → `/security-ops` | Design decisions live in the system already; a UX spec would restate the obvious. Record intent in the commit message. |
| **M** | New component, new chapter in `/design-system`, new page section | `/ux` (short spec) → `/ui` → `/review-qa` → `/security-ops` | New behaviour needs acceptance criteria before pixels. |
| **L** | New flow, new content type, data layer change, anything touching `app/content` facades or `app/lib/data.ts` | All four, plus `/security-ops` consulted at the *start* for the data boundary | Data and secrets decisions are cheaper before code exists. |

When unsure between two sizes, pick the larger — a spec that turns out to be short costs ten minutes; a build with no agreed "done" costs a re-do.

## Stage contracts (summary)

Full contracts, with the exact gate questions each seat must be able to answer, are in `references/pipeline.md`. The short form:

| Stage | Seat | Reads | Leaves behind | Gate |
|---|---|---|---|---|
| 0 Intake | `/factory` | request, repo state | `docs/briefs/<slug>.md` | A reviewer can state what "done" is |
| 1 Spec | `/ux` | brief, nav-data, content registry | `docs/specs/<slug>.md` | Criteria are Given/When/Then and browser-checkable; real copy; all states |
| 2 Build | `/ui` | spec, `app/lib/design-system.ts`, `globals.css`, `tailwind.config.ts` | tokens + component + specimen chapter; UI note appended to spec | Brand-only colours, light+dark+system, mobile, tokens in all three files |
| 3 Review | `/review-qa` | spec + diff | `docs/reviews/<slug>.md`, green `qa-gate.sh` | Verdict: ship / ship-with-fixes / hold; every blocker resolved or accepted in writing |
| 4 Release | `/security-ops` | review verdict | green `preflight.sh`, deploy, `docs/releases/<date>-<slug>.md` | Live URL returns 200, smoke-tested, rollback path named |
| 5 Learn | `/factory` | all four files | 1–3 lines in `docs/learnings.md` | Something the next change benefits from |

## Working agreements

These exist because each one was learned the hard way on this repo.

- **Downstream reads upstream first.** `/ui` opens the spec before touching code; `/review-qa` opens the spec before the diff. A seat that finds a gap appends a `## Questions` section to the upstream file and stops — guessing creates work for three people.
- **Verify in the browser, then verify the CSS.** A sidebar hover tint shipped "working" in screenshots while no CSS rule for it existed (Tailwind had silently dropped `bg-ink/[0.05]` because `--ink` is a hex, not an RGB triplet). Screenshots show what *is*; stylesheet inspection shows what *will be* on a user's machine. QA does both.
- **Tokens live in three files or they don't exist.** `app/lib/design-system.ts`, `app/globals.css`, `tailwind.config.ts`. A colour that's only in Tailwind is a bug.
- **Commit messages:** `Area: imperative summary` — `Sidebar: pack each group into a collapsible disclosure`, `Map: brand-aligned placeholder when NEXT_PUBLIC_MAPBOX_TOKEN is unset`. The area is the component or chapter, so `git log` reads as a changelog.
- **One slug, one change.** Don't fold a drive-by fix into a feature's trail. Open a second XS brief; it takes a minute and keeps the review honest.
- **A red gate doesn't ship.** `/security-ops` won't deploy over a failing `qa-gate.sh` or `preflight.sh`. If the failure is pre-existing debt (the script says `LEGACY`), it's recorded in the release note, not ignored.

## Team mode in Cowork / Claude Code

- Each seat can be a separate session; the file trail is the shared memory. Tell each session its slug and seat: *"You're `/ui` on `guides-legend`; the spec is `docs/specs/guides-legend.md`."*
- When one person runs the whole line, invoke the role skills in order within one session. Don't spawn subagents for seats unless the user asks — a fresh agent re-derives context the file trail already holds.
- Role boundaries: UX names the UX moment (`data-surface="rental"`), not the hex. UI changes acceptance criteria only by appending to the spec. QA reports; it fixes only when asked. Ops never deploys a red gate.

## Definition of Done (whole line)

A change is done when all of these are true, and you can point at the file that proves each:

1. Brief exists and names the owner and the success signal.
2. Spec's acceptance criteria are all ticked in the review report.
3. `qa-gate.sh` and `preflight.sh` both green (or `LEGACY` items recorded).
4. Deployed to `outlas-ds` on Vercel; live URL verified with a 200 and a browser smoke test in both themes.
5. Release note written with commit SHA, live URL, rollback path.
6. One learning captured.

## References

- `references/pipeline.md` — full stage contracts, gate questions, handoff etiquette.
- `references/templates.md` — Brief, Release note, Learning entry.
- Role skills: `/ux`, `/ui`, `/review-qa`, `/security-ops` (each in `.claude/skills/`).
- Design rationale for the system itself: `docs/DESIGN_SYSTEM.md`.
