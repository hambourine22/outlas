---
type: llm
focus: trace
weight: 1
---

The result matches this description: preflight.sh is executed and its real output is reported; POSTGRES_* variables are described as Vercel-injected, server-only and never NEXT_PUBLIC_; the answer calls for import "server-only" in app/lib/data.ts, parameterised tagged-template SQL for any input, and pages reading through the app/content facade; the deploy sequence is preflight → env in Vercel → vercel --prod --yes → curl 200 → browser smoke → release note with rollback; no secret values are printed and no deploy is performed.
