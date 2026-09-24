#!/bin/sh
set -u
. "$ORB_CLI_DIR/core/common.sh"

ci=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    --ci) ci=true ;;
    --help|-h)
      [ "$#" -eq 1 ] || orb_die 'Git doctor help does not accept additional arguments.' 2
      printf 'Usage: orbu git doctor [--ci]\n'
      exit 0
      ;;
    *) orb_die "Unknown git doctor option: $1" 2 ;;
  esac
  shift
done

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

if orb_has git && orb_git_checkout; then pass 'Git checkout'; else fail 'Git checkout unavailable'; fi

for git_file in commitlint.config.cjs .lintstagedrc.json .husky/pre-commit .husky/commit-msg; do
  if [ -f "$ORB_PROJECT_ROOT/$git_file" ]; then pass "$git_file"; else fail "missing $git_file"; fi
done

if [ -x "$ORB_PROJECT_ROOT/.husky/pre-commit" ]; then pass '.husky/pre-commit is executable'; else fail '.husky/pre-commit is not executable'; fi
if [ -x "$ORB_PROJECT_ROOT/.husky/commit-msg" ]; then pass '.husky/commit-msg is executable'; else fail '.husky/commit-msg is not executable'; fi

if grep -F 'orbu git pre-commit' "$ORB_PROJECT_ROOT/.husky/pre-commit" >/dev/null 2>&1; then
  pass 'pre-commit is a thin Orbu adapter'
else
  fail 'pre-commit is not a thin Orbu adapter'
fi
if grep -F 'orbu git commit-message' "$ORB_PROJECT_ROOT/.husky/commit-msg" >/dev/null 2>&1; then
  pass 'commit-msg is a thin Orbu adapter'
else
  fail 'commit-msg is not a thin Orbu adapter'
fi

for git_dependency in @commitlint/cli @commitlint/config-conventional husky lint-staged semver; do
  expected=$(orb_package_dependency_version "$git_dependency" 2>/dev/null || true)
  actual=$(orb_local_package_version "$git_dependency" 2>/dev/null || true)
  if [ -z "$expected" ]; then
    fail "package.json is missing $git_dependency"
  elif [ -z "$actual" ]; then
    fail "$git_dependency is not installed (expected $expected)"
  elif [ "$actual" = "$expected" ]; then
    pass "$git_dependency $actual"
  else
    fail "$git_dependency $actual does not match package.json $expected"
  fi
done

if [ "$ci" = false ] && orb_has git && orb_git_checkout; then
  hooks_path=$(git -C "$ORB_PROJECT_ROOT" config --local --get core.hooksPath 2>/dev/null || true)
  if [ "$hooks_path" = .husky/_ ]; then
    pass 'core.hooksPath=.husky/_'
  else
    fail "core.hooksPath is '${hooks_path:-unset}'; run orbu git setup"
  fi
fi

if [ "$failures" -ne 0 ]; then
  printf '\n%d Git tooling failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nOrb Git doctor PASS\n'
