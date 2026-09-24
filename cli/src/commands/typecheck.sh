#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"
orb_require_repository_source

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || orb_die 'Typecheck help does not accept additional arguments.' 2
    printf 'Usage: orbo typecheck\n'
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || orb_die 'Typecheck does not accept arguments.' 2 ;;
  *) orb_die "Unknown typecheck option: $1" 2 ;;
esac

orb_need pnpm
cd "$ORB_PROJECT_ROOT"
orb_print_info 'Type-checking package source'
pnpm exec tsc --noEmit
orb_print_info 'Type-checking colocated tests'
exec pnpm exec tsc -p tsconfig.test.json --noEmit
