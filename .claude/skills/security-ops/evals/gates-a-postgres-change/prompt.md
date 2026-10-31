---
tags: [security-ops]
max_turns: 25
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

We're about to wire Vercel Postgres into the map so resorts come from the database instead of the typed arrays. Before anyone writes code: what env vars are involved, what has to be locked down, and what does the deploy look like? Run preflight on the current tree too.
