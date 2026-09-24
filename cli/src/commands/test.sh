#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"
orb_require_repository_source

mode=run
case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || orb_die 'Test help does not accept additional arguments.' 2
    cat <<'USAGE'
Usage:
  orbu test [vitest arguments]
  orbu test --coverage [vitest arguments]
  orbu test --watch [vitest arguments]

The default mode executes Vitest once. Positional arguments after the optional
mode are forwarded to Vitest, so a colocated suite can be targeted directly.
USAGE
    exit 0
    ;;
  --coverage|coverage)
    mode=coverage
    shift
    ;;
  --watch|watch)
    mode=watch
    shift
    ;;
esac

orb_need pnpm
cd "$ORB_PROJECT_ROOT"

case "$mode" in
  run) exec pnpm exec vitest run "$@" ;;
  coverage) exec pnpm exec vitest run --coverage "$@" ;;
  watch) exec pnpm exec vitest "$@" ;;
esac
