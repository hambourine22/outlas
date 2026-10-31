#!/usr/bin/env bash
# Oütlas pre-deploy preflight — secrets · env hygiene · dependencies · dangerous patterns · headers.
#
# Usage:   bash .claude/skills/security-ops/scripts/preflight.sh
#
# Exit 0 when nothing blocks a deploy (warnings are printed and should go in the release note).
# Exit 1 on any FAIL. Every check runs regardless so you see the full picture.
#
# Needs: git, pnpm. No network except `pnpm audit` (skip with SKIP_AUDIT=1 when offline).

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT" || exit 2
SELF=".claude/skills/security-ops/scripts/preflight.sh"

BOLD=$(printf '\033[1m'); DIM=$(printf '\033[2m'); RED=$(printf '\033[31m'); GREEN=$(printf '\033[32m'); YELLOW=$(printf '\033[33m'); RESET=$(printf '\033[0m')

fails=0; warns=0
pass() { printf '%s  ✓ %s%s\n' "$GREEN" "$1" "$RESET"; }
warn() { printf '%s  ! %s%s\n' "$YELLOW" "$1" "$RESET"; warns=$((warns + 1)); }
fail() { printf '%s  ✗ %s%s\n' "$RED" "$1" "$RESET"; fails=$((fails + 1)); }
head_() { printf '\n%s▶ %s%s\n' "$BOLD" "$1" "$RESET"; }

printf '%sOütlas preflight%s %s— %s%s\n' "$BOLD" "$RESET" "$DIM" "$ROOT" "$RESET"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  fail "not a git repository — preflight relies on the tracked-file set"
  exit 1
fi

# 1. Env files must not be tracked --------------------------------------------
head_ "Env files"
tracked_env=$(git ls-files | grep -E '(^|/)\.env(\..*)?$' || true)
if [ -n "$tracked_env" ]; then
  fail "env file(s) tracked in git — rotate the values, then git rm --cached:"
  printf '%s\n' "$tracked_env" | sed 's/^/      /'
else
  pass "no .env* files tracked"
fi
if grep -qE '^\.env\*\.local' .gitignore 2>/dev/null && grep -qE '^\.env$' .gitignore 2>/dev/null; then
  pass ".gitignore covers .env and .env*.local"
else
  warn ".gitignore should contain both '.env' and '.env*.local'"
fi

# 2. Secret-shaped strings in tracked files -----------------------------------
head_ "Secret scan (tracked files)"
EXCL=(":!pnpm-lock.yaml" ":!$SELF" ":!.claude/skills/security-ops/references/*" ":!.claude/skills/review-qa/references/*" ":!public/*")
# -e keeps patterns that begin with '-' (e.g. private-key headers) from being read as options.
scan() { git grep -nIE -e "$1" -- . "${EXCL[@]}" 2>/dev/null || true; }

hits=$(scan 'sk\.eyJ[A-Za-z0-9._-]{20,}');                 [ -n "$hits" ] && { fail "Mapbox SECRET token (sk.) in tracked files:"; echo "$hits" | sed 's/^/      /'; }
hits=$(scan 'postgres(ql)?://[^[:space:]"'"'"']+:[^[:space:]"'"'"'@]+@'); [ -n "$hits" ] && { fail "Postgres URL with credentials in tracked files:"; echo "$hits" | sed 's/^/      /'; }
hits=$(scan 'AKIA[0-9A-Z]{16}');                            [ -n "$hits" ] && { fail "AWS access key id in tracked files:"; echo "$hits" | sed 's/^/      /'; }
hits=$(scan 'ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}'); [ -n "$hits" ] && { fail "GitHub token in tracked files:"; echo "$hits" | sed 's/^/      /'; }
hits=$(scan 'sk-[A-Za-z0-9]{32,}|sk-ant-[A-Za-z0-9_-]{20,}'); [ -n "$hits" ] && { fail "API key (sk-…) in tracked files:"; echo "$hits" | sed 's/^/      /'; }
hits=$(scan 'xox[baprs]-[A-Za-z0-9-]{10,}');                [ -n "$hits" ] && { fail "Slack token in tracked files:"; echo "$hits" | sed 's/^/      /'; }
hits=$(scan '-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'); [ -n "$hits" ] && { fail "Private key block in tracked files:"; echo "$hits" | sed 's/^/      /'; }
hits=$(scan 'pk\.eyJ[A-Za-z0-9._-]{20,}');                 [ -n "$hits" ] && { warn "Mapbox PUBLIC token (pk.) hard-coded — should come from NEXT_PUBLIC_MAPBOX_TOKEN:"; echo "$hits" | sed 's/^/      /'; }
[ "$fails" -eq 0 ] && pass "no secret-shaped strings found"

# 3. NEXT_PUBLIC_ inventory ----------------------------------------------------
head_ "NEXT_PUBLIC_ inventory (these ship to the browser)"
pubvars=$(git grep -hoE 'NEXT_PUBLIC_[A-Z0-9_]+' -- app '*.ts' '*.tsx' '*.mjs' '*.js' 2>/dev/null | sort -u || true)
if [ -z "$pubvars" ]; then
  pass "none referenced"
else
  printf '%s\n' "$pubvars" | sed 's/^/      /'
  bad=$(printf '%s\n' "$pubvars" | grep -E 'SECRET|PASSWORD|PRIVATE|POSTGRES|DATABASE|DB_|_SK$|SERVICE_ROLE' || true)
  if [ -n "$bad" ]; then
    fail "NEXT_PUBLIC_ name looks sensitive — it would be embedded in client JS:"
    printf '%s\n' "$bad" | sed 's/^/      /'
  else
    pass "no sensitive-looking NEXT_PUBLIC_ names"
  fi
fi

# 4. dangerouslySetInnerHTML ---------------------------------------------------
head_ "Raw HTML injection"
dsih=$(git grep -n 'dangerouslySetInnerHTML' -- app 2>/dev/null || true)
unsanctioned=$(printf '%s\n' "$dsih" | grep -v '^app/layout.tsx:' | grep -v '^$' || true)
if [ -n "$unsanctioned" ]; then
  warn "dangerouslySetInnerHTML outside the sanctioned theme bootstrap (app/layout.tsx) — needs review sign-off:"
  printf '%s\n' "$unsanctioned" | sed 's/^/      /'
else
  pass "dangerouslySetInnerHTML only in app/layout.tsx (static theme bootstrap)"
fi

# 5. Server-only guard on data modules ----------------------------------------
head_ "Server/client data boundary"
if [ -f app/lib/data.ts ]; then
  if grep -q '"server-only"\|'"'"'server-only'"'" app/lib/data.ts; then
    pass "app/lib/data.ts imports server-only"
  else
    warn "app/lib/data.ts lacks import \"server-only\" — a client import would ship DB code to the browser"
  fi
fi
interp=$(git grep -nE 'sql\.query\(\s*`[^`]*\$\{' -- app 2>/dev/null || true)
if [ -n "$interp" ]; then
  fail "string-interpolated SQL in sql.query() — use the tagged template sql\`…\${x}\` (parameterised):"
  printf '%s\n' "$interp" | sed 's/^/      /'
else
  pass "no interpolated sql.query() strings"
fi

# 6. Build artefacts not tracked ----------------------------------------------
head_ "Build artefacts"
arte=$(git ls-files | grep -E '^(\.next|\.vercel|out|build)/|tsbuildinfo$' || true)
if [ -n "$arte" ]; then
  fail "build artefacts tracked in git:"
  printf '%s\n' "$arte" | sed 's/^/      /'
else
  pass ".next/ .vercel/ and tsbuildinfo untracked"
fi

# 7. Dependency audit ---------------------------------------------------------
head_ "Dependency audit (pnpm audit --prod, high+)"
if [ "${SKIP_AUDIT:-0}" = "1" ]; then
  warn "skipped (SKIP_AUDIT=1)"
elif pnpm audit --prod --audit-level=high >/tmp/outlas-audit.$$ 2>&1; then
  pass "no high/critical advisories in production dependencies"
else
  fail "pnpm audit reports high/critical advisories — see below"
  sed 's/^/      /' /tmp/outlas-audit.$$ | head -40
fi
rm -f /tmp/outlas-audit.$$

# 8. Security headers ---------------------------------------------------------
head_ "Security headers"
if grep -q 'headers' next.config.mjs 2>/dev/null; then
  pass "next.config.mjs defines headers()"
else
  warn "next.config.mjs has no headers() — baseline snippet in references/runbooks.md (XS brief)"
fi

# 9. Working tree state (informational) ----------------------------------------
head_ "Working tree"
if [ -z "$(git status --porcelain)" ]; then
  pass "clean — $(git log -1 --format='%h %s')"
else
  warn "uncommitted changes present — deploy ships the working tree, not HEAD:"
  git status --short | sed 's/^/      /' | head -20
fi
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')
[ "$branch" = "main" ] && pass "on main" || warn "on branch '$branch' — production deploys normally come from main"

# Summary ------------------------------------------------------------------------
printf '\n%s── Summary ──%s  %s%d fail%s · %s%d warn%s\n' "$BOLD" "$RESET" "$RED" "$fails" "$RESET" "$YELLOW" "$warns" "$RESET"
if [ "$fails" -gt 0 ]; then
  printf '%sPreflight RED — do not deploy.%s\n' "$RED" "$RESET"
  exit 1
fi
if [ "$warns" -gt 0 ]; then
  printf '%sPreflight green with warnings — record them in docs/releases/<date>-<slug>.md.%s\n' "$YELLOW" "$RESET"
else
  printf '%sPreflight green.%s\n' "$GREEN" "$RESET"
fi
printf 'Next: vercel --prod --yes  →  curl -sI https://outlas-ds.vercel.app/<route>  →  release note\n'
exit 0
