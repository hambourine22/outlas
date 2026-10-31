# Templates — Brief · Release note · Learning

Copy the block, fill every line, delete nothing. Empty fields are a signal the brief isn't ready, not a formatting choice.

---

## Brief — `docs/briefs/<slug>.md`

```markdown
# <Title in plain words>

**Slug:** `<slug>` · **Owner:** <name> · **Opened:** <YYYY-MM-DD> · **Size:** XS | S | M | L

## Problem
<One or two sentences. What's wrong or missing for whom. Written from the user's side, not the code's.>

## Why now
<What prompted this — a user report, a design review, a dependency, a date.>

## Success signal
<The one observable change when this is live. "A rider on a phone can open the Foundations group in one tap" — not "sidebar improved".>

## In scope
- <bullet>

## Out of scope
- <bullet — things people might assume are included>

## Seats
- [ ] `/ux` — <runs | skipped because …>
- [ ] `/ui` — <runs | skipped because …>
- [ ] `/review-qa` — runs
- [ ] `/security-ops` — runs

## Links
<Screenshots, references, related briefs, the TwelveLabs or Pentagram pattern being borrowed, etc.>
```

---

## Release note — `docs/releases/<YYYY-MM-DD>-<slug>.md`

```markdown
# Release — <Title> · <YYYY-MM-DD>

**Slug:** `<slug>` · **Commit:** `<sha>` · **Project:** outlas-ds · **Live:** https://outlas-ds.vercel.app/<route>

## What changed
- <bullet per user-visible change, in the voice of the commit log: "Sidebar: groups now collapse">

## Verified
- `qa-gate.sh` ✓ · `preflight.sh` ✓ (LEGACY: <list or "none">)
- Live 200 on: <routes>
- Browser smoke: light ✓ dark ✓ system ✓ · phone ✓

## Env / config changes
<"none" or the var names (never values) and where they were set.>

## Rollback
`vercel rollback` → previous deployment `<url or id>`, or `git revert <sha>` + `vercel --prod --yes`.

## Trail
brief `docs/briefs/<slug>.md` · spec `docs/specs/<slug>.md` · review `docs/reviews/<slug>.md`
```

---

## Learning entry — append to `docs/learnings.md`

One to three lines. Date, slug, the thing. Write it so a stranger on the next change gets the benefit without reading the trail.

```markdown
- **<YYYY-MM-DD> · `<slug>`** — <What surprised us or what we'd do differently. E.g. "Tailwind `/[alpha]` opacity needs an RGB-triplet variable; our semantic tokens are hex, so bake alpha into the variable and bind with `bg-[var(--token)]`.">
```

Good learnings are about the *process or the platform*, not the feature: a gotcha, a check that should have been earlier, a tool that saved time. If the lesson is big enough to change how a seat works, also update that seat's `SKILL.md` — the learnings file is the inbox, the skill is where it lands.
