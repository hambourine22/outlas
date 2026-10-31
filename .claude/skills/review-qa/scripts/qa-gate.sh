#!/usr/bin/env bash
# Oütlas QA gate — typecheck · lint · token drift · build.
#
# Usage:   bash .claude/skills/review-qa/scripts/qa-gate.sh
#          SKIP_BUILD=1 bash .claude/skills/review-qa/scripts/qa-gate.sh   # while a dev server holds .next/
#
# Exit 0 when every check passes (LEGACY token findings are reported, not fatal).
# Exit 1 if any check fails — but every check still runs so you see them all at once.
#
# Works as a git pre-push hook or a CI step: it needs only pnpm and node.

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT" || exit 2

BOLD=$(printf '\033[1m'); DIM=$(printf '\033[2m'); RED=$(printf '\033[31m'); GREEN=$(printf '\033[32m'); YELLOW=$(printf '\033[33m'); RESET=$(printf '\033[0m')

failures=0
summary=""

run_check() {
  # $1 = label, $2.. = command
  local label="$1"; shift
  printf '%s▶ %s%s\n' "$BOLD" "$label" "$RESET"
  local start
  start=$(date +%s)
  if "$@"; then
    local dur=$(( $(date +%s) - start ))
    printf '%s  ✓ %s (%ss)%s\n\n' "$GREEN" "$label" "$dur" "$RESET"
    summary="${summary}  ✓ ${label}\n"
  else
    local code=$?
    local dur=$(( $(date +%s) - start ))
    printf '%s  ✗ %s failed (exit %s, %ss)%s\n\n' "$RED" "$label" "$code" "$dur" "$RESET"
    summary="${summary}  ✗ ${label}\n"
    failures=$((failures + 1))
  fi
}

printf '%sOütlas QA gate%s %s— %s%s\n\n' "$BOLD" "$RESET" "$DIM" "$ROOT" "$RESET"

if [ ! -d node_modules ]; then
  printf '%snode_modules missing — running pnpm install%s\n' "$YELLOW" "$RESET"
  pnpm install --frozen-lockfile || { echo "pnpm install failed"; exit 1; }
fi

run_check "Typecheck (tsc --noEmit)"   pnpm exec tsc --noEmit --pretty
run_check "Lint (next lint)"            pnpm lint
run_check "Token drift (check-tokens)"  node "$ROOT/.claude/skills/review-qa/scripts/check-tokens.mjs"

if [ "${SKIP_BUILD:-0}" = "1" ]; then
  printf '%s▶ Build (next build)%s\n%s  – skipped (SKIP_BUILD=1). Vercel runs the full build on deploy.%s\n\n' "$BOLD" "$RESET" "$YELLOW" "$RESET"
  summary="${summary}  – Build skipped\n"
else
  run_check "Build (next build)"        pnpm build
fi

printf '%s── Summary ──%s\n' "$BOLD" "$RESET"
printf '%b' "$summary"

if [ "$failures" -gt 0 ]; then
  printf '\n%s%s check(s) failed. Fix before handing to /security-ops.%s\n' "$RED" "$failures" "$RESET"
  exit 1
fi

printf '\n%sGate green.%s Next: browser matrix (light · dark · system × desktop · 375px), then docs/reviews/<slug>.md\n' "$GREEN" "$RESET"
exit 0
