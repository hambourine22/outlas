#!/usr/bin/env bash
# Oütlas QA gate — typecheck · lint · token drift · build.
#
# Usage:   bash .claude/skills/review-qa/scripts/qa-gate.sh
#          SKIP_BUILD=1 bash .claude/skills/review-qa/scripts/qa-gate.sh   # explicit opt-out — the build runs in an
#                                                                          # isolated copy, so a dev server is no reason
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

# Build — always in an isolated copy of the working tree, so it never fights a
# running dev server for .next/ and the full production build actually runs
# every time. It is the only check that catches prerender-time errors (a
# React-19-only hook in a client component passed tsc and lint and broke the
# Vercel build). SKIP_BUILD=1 is an explicit opt-out; if you use it, say so in
# the review report — the release worktree build is then the first full build.
isolated_build() {
  local tmp code
  tmp=$(mktemp -d) || return 2
  rsync -a --exclude node_modules --exclude .next --exclude .git --exclude .vercel --exclude '*.tsbuildinfo' "$ROOT/" "$tmp/" || { rm -rf "$tmp"; return 2; }
  ln -s "$ROOT/node_modules" "$tmp/node_modules"
  ( cd "$tmp" && pnpm build )
  code=$?
  rm -rf "$tmp"
  return $code
}

if [ "${SKIP_BUILD:-0}" = "1" ]; then
  printf '%s▶ Build (next build)%s\n%s  – skipped (SKIP_BUILD=1). Say so in the review report; the release worktree build in /security-ops is now the first full build.%s\n\n' "$BOLD" "$RESET" "$YELLOW" "$RESET"
  summary="${summary}  – Build skipped (SKIP_BUILD=1)\n"
else
  run_check "Build (next build, isolated copy of the working tree)" isolated_build
fi

printf '%s── Summary ──%s\n' "$BOLD" "$RESET"
printf '%b' "$summary"

if [ "$failures" -gt 0 ]; then
  printf '\n%s%s check(s) failed. Fix before handing to /security-ops.%s\n' "$RED" "$failures" "$RESET"
  exit 1
fi

printf '\n%sGate green.%s Next: browser matrix (light · dark · system × desktop · 375px), then docs/reviews/<slug>.md\n' "$GREEN" "$RESET"
exit 0
