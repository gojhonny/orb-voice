#!/bin/sh
set -u
. "$ORB_CLI_DIR/core/common.sh"

ci=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    --ci) ci=true ;;
    --help|-h)
      [ "$#" -eq 1 ] || orb_die 'Doctor help does not accept additional arguments.' 2
      printf 'Usage: orbu doctor [--ci]\n'
      exit 0
      ;;
    *) orb_die "Unknown doctor option: $1" 2 ;;
  esac
  shift
done

failures=0
pass() {
  doctor_detail=${2:+ — $2}
  printf '%sPASS  %s%s%s\n' "$ORB_COLOR_GREEN" "$1" "$doctor_detail" "$ORB_COLOR_RESET"
}
warn() {
  doctor_detail=${2:+ — $2}
  printf '%sWARN  %s%s%s\n' "$ORB_COLOR_YELLOW" "$1" "$doctor_detail" "$ORB_COLOR_RESET"
}
fail() {
  doctor_detail=${2:+ — $2}
  printf '%sFAIL  %s%s%s\n' "$ORB_COLOR_RED" "$1" "$doctor_detail" "$ORB_COLOR_RESET" >&2
  [ -z "${3:-}" ] || printf '      fix: %s\n' "$3" >&2
  failures=$((failures + 1))
}

orb_print_logo
printf 'Orbu engineering doctor\n'

if orb_has node; then
  node_version=$(node --version 2>/dev/null || true)
  node_major=$(printf '%s' "$node_version" | sed 's/^v\([0-9][0-9]*\).*/\1/')
  if [ "$node_major" = 24 ]; then pass node "$node_version"; else fail node "$node_version" 'Install the version from .nvmrc.'; fi
else
  fail node 'not available' 'Install Node.js 24.'
fi

expected_pnpm=$(orb_package_value packageManager 2>/dev/null | sed 's/^pnpm@//' || true)
if orb_has pnpm; then
  actual_pnpm=$(pnpm --version 2>/dev/null || true)
  if [ "$actual_pnpm" = "$expected_pnpm" ]; then pass pnpm "$actual_pnpm"; else fail pnpm "$actual_pnpm (expected $expected_pnpm)" 'Activate the packageManager version.'; fi
else
  fail pnpm 'not available' 'Enable Corepack and activate pnpm.'
fi

if orb_has git; then pass git "$(git --version 2>/dev/null || true)"; else fail git 'not available' 'Install Git.'; fi

for required_file in package.json pnpm-lock.yaml biome.json tsconfig.json tsconfig.test.json vitest.config.ts commitlint.config.cjs .lintstagedrc.json cli/orbu; do
  if [ -f "$ORB_PROJECT_ROOT/$required_file" ]; then pass "$required_file"; else fail "$required_file" missing 'Restore the repository configuration.'; fi
done

if [ -d "$ORB_PROJECT_ROOT/node_modules" ]; then
  pass install-state node_modules
else
  fail install-state missing 'Run pnpm install --no-frozen-lockfile.'
fi

for dependency in typescript @biomejs/biome tsdown vitest happy-dom @vitest/coverage-v8 @commitlint/cli @commitlint/config-conventional husky lint-staged semver; do
  expected=$(orb_package_dependency_version "$dependency" 2>/dev/null || true)
  actual=$(orb_local_package_version "$dependency" 2>/dev/null || true)
  if [ -z "$expected" ]; then
    fail "$dependency" 'not declared' 'Add it to package.json devDependencies.'
  elif [ -z "$actual" ]; then
    fail "$dependency" "not installed (expected $expected)" 'Run pnpm install --no-frozen-lockfile.'
  elif [ "$actual" = "$expected" ]; then
    pass "$dependency" "$actual"
  else
    fail "$dependency" "$actual (expected $expected)" 'Reinstall the dependency graph.'
  fi
done

audit_count=0
for audit_file in "$ORB_PROJECT_ROOT"/.audits/*.audit.sh; do
  [ -f "$audit_file" ] || continue
  audit_count=$((audit_count + 1))
  if /bin/sh -n "$audit_file"; then pass "$(orb_rel "$audit_file")"; else fail "$(orb_rel "$audit_file")" 'invalid shell syntax'; fi
done
[ "$audit_count" -gt 0 ] || fail audits missing 'Restore .audits/*.audit.sh.'

if [ "$ci" = true ]; then
  if "$ORB_CLI_DIR/commands/git-doctor.sh" --ci >/dev/null 2>&1; then pass git-tooling 'CI configuration'; else fail git-tooling 'invalid CI configuration' 'Run orbu git doctor --ci.'; fi
else
  if "$ORB_CLI_DIR/commands/git-doctor.sh" >/dev/null 2>&1; then pass git-tooling configured; else fail git-tooling 'not configured' 'Run orbu git setup, then orbu git doctor.'; fi

  direct_bin=$(orb_default_bin_dir 2>/dev/null || true)
  if [ -n "$direct_bin" ] && [ -x "$direct_bin/orbu" ] && [ "$(sed -n '2p' "$direct_bin/orbu" 2>/dev/null || true)" = '# managed-by: orbu' ]; then
    pass direct-orbu "$direct_bin/orbu"
  else
    warn direct-orbu 'not configured; run pnpm install or ./cli/orbu setup --launcher'
  fi
fi

if [ "$failures" -gt 0 ]; then
  orb_print_error "Orbu doctor FAIL — $failures required check(s) failed"
  exit 1
fi
orb_print_success 'Orbu doctor PASS'
