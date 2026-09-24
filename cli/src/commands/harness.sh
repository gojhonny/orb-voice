#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"
orb_require_repository_source

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || orb_die 'Harness help does not accept additional arguments.' 2
    cat <<'USAGE'
Usage: orbu harness [harness-score arguments]

Run pinned harness-score 1.5.2 explicitly for this checkout. Arguments are
forwarded to the utility. This command is engineering-only and is never
part of the Orbu runtime API.
USAGE
    exit 0
    ;;
esac

orb_need npx
cd "$ORB_PROJECT_ROOT"
exec npx --yes harness-score@1.5.2 "$@"
