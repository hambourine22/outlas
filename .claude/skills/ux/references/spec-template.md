# Spec template — `docs/specs/<slug>.md`

Copy the whole block. Keep the headings; fill every section; mark drafts `[draft copy]` rather than leaving blanks.

```markdown
# <Title> — spec

**Slug:** `<slug>` · **Brief:** `docs/briefs/<slug>.md` · **UX:** <name> · **Date:** <YYYY-MM-DD> · **Status:** draft | ready-for-ui | built

## 1. Problem & success signal
<One paragraph. What's wrong for whom today; the one observable change when this is live.>

## 2. Users & context
- **Who:** <rider | provider | guide | reader>
- **Device & moment:** <phone, outdoors, one-handed | laptop, planning at home …>
- **UX moment:** `data-surface="<rental | repair | story | manifest | carbon>"` — <why this moment>
- **Entry points:** <how they arrive — nav, map pin, story link, direct URL>

## 3. Flow

### Primary path
1. <Step — what the user sees / does>
2. <Step>
3. <Step — the success state>

### Branches & states
- **Empty:** <what shows when there's nothing — and what it invites them to do>
- **Loading:** <skeleton | nothing | inline indicator — and for how long before it's "slow">
- **Error:** <what went wrong, in their words; the one action they can take>
- **No token / offline:** <degrade like the map's no-Mapbox-token placeholder, or …>
- **Returning user:** <what's remembered — theme is in localStorage `outlas:theme`; sidebar expansion is per session>
- **Narrow (≤ 640):** <what collapses, stacks, or hides>

## 4. Content
| Where | Copy | Notes |
|---|---|---|
| Heading | <Vollkorn, carries story> | |
| Label | <Archivo Narrow, ≤ 2 words, uppercase via `.label`> | |
| Button | <verb-first> | |
| Empty state | <one line + one action> | |
| Error | <plain, no "Oops"> | `[draft copy]` if unsure |

## 5. Structure
- **Reuses:** <`Nav` / `chip` / `label` / `Chart` / score pill / map legend …>
- **New:** <component or pattern — one line on why nothing existing fits>
- **Specimen needed in `/design-system`:** yes | no — <chapter and group if yes>
- **Content source:** <`app/content/map/*.ts` | `stories/registry.ts` | new facade — never a backend directly>

## 6. Accessibility requirements
- **Keyboard path:** <Tab order through the flow; Enter/Space on …; Escape closes …>
- **Names:** <what each control announces — e.g. group header: "Foundations, button, collapsed">
- **Text classes:** <which text is body (4.5:1) vs large (3:1) so UI knows the contrast target>
- **Motion:** <what animates; what happens under `prefers-reduced-motion`>
- **Targets:** <anything smaller than 44×44 needs a reason here>

## 7. Acceptance criteria
Each one is checkable in a browser or by a script. QA ticks these verbatim.

- [ ] **AC1** — Given <state>, when <action>, then <observable result>.
- [ ] **AC2** — Given <state>, when <action>, then <observable result>.
- [ ] **AC3** — Given the theme is dark (or system on a dark OS), when <…>, then <…> — colours still resolve to brand tokens.
- [ ] **AC4** — Given a 375px viewport, when <…>, then no horizontal scroll and <…>.
- [ ] **AC5** — Given keyboard only, when Tab reaches <control>, then focus is visible and <action> works on Enter.

## 8. Assumptions & open questions
| # | Assumption | Confidence | If wrong |
|---|---|---|---|
| A1 | <statement> | High / Medium / Low | <what changes> |

**Counter-evidence:** <one credible reason the main framing could be wrong, and why the spec still holds.>

**Open questions (≤ 3):**
1. <question — who answers it>

## 9. Appendix
- **Options considered:** <A, B — why this one>
- **References:** <links, screenshots, the pattern being borrowed>
- **Research notes:** <if any>

---
Next: `/ui` on `<slug>`. UI decides: <exact tokens, spacing rungs, specimen layout>.
```
