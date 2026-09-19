#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"
orb_require_repository_source

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || orb_die 'Build help does not accept additional arguments.' 2
    printf 'Usage: orbv build\n'
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || orb_die 'Build does not accept arguments.' 2 ;;
  *) orb_die "Unknown build option: $1" 2 ;;
esac

orb_need pnpm
cd "$ORB_PROJECT_ROOT"
orb_print_info 'Building package entry points'
pnpm exec tsdown
orb_print_info 'Building standalone browser entry point'
exec pnpm exec tsdown --config tsdown.standalone.config.ts
