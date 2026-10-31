# Oütlas software factory

Five project skills that turn a brief into a live release through four role gates. Each role is a slash command; each handoff is a file in `docs/` so work survives between sessions and between people.

```
Brief ──▶ /ux ──▶ /ui ──▶ /review-qa ──▶ /security-ops ──▶ Live
          spec     build     report         release note
```

| Command | Seat | Produces | Gate |
|---|---|---|---|
| `/factory` | Orchestrator | Stage plan, sizing, which gates apply | Everyone agrees what "done" means |
| `/ux` | UX | `docs/specs/<slug>.md` | Acceptance criteria a browser can verify |
| `/ui` | UI | Tokens + component + specimen in `/design-system` | Brand-only, both themes, mobile |
| `/review-qa` | Review / QA | `docs/reviews/<slug>.md` + green `qa-gate.sh` | Ship / ship-with-fixes / hold |
| `/security-ops` | Security / Ops | Green `preflight.sh`, deploy, `docs/releases/<date>-<slug>.md` | Live, verified, rollback named |

## Run the gates by hand

```bash
bash .claude/skills/review-qa/scripts/qa-gate.sh          # typecheck · lint · token drift · build
bash .claude/skills/security-ops/scripts/preflight.sh     # secrets · env hygiene · deps · headers
```

Both exit non-zero on a blocker and print a one-line summary per check, so they also work as a pre-push hook or a CI step.

## Working in a team

- One person (or one Claude session) per seat is the intended mode; one person wearing all hats in sequence works too.
- The slug is the thread: `docs/briefs/<slug>.md`, `docs/specs/<slug>.md`, `docs/reviews/<slug>.md`, `docs/releases/<date>-<slug>.md`.
- A downstream seat that finds a gap appends a **Questions** section to the upstream file rather than guessing.
- Learnings go in `docs/learnings.md`, one to three lines per release.

Start with `/factory` when you're not sure which seat a request needs.
