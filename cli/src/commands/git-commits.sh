#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"

mode=
from_ref=
to_ref=

while [ "$#" -gt 0 ]; do
  case "$1" in
    --last)
      [ -z "$mode" ] || orb_die 'Choose either --last or --from/--to.' 2
      mode=last
      ;;
    --from)
      orb_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || orb_die '--from requires a Git reference.' 2
      [ -z "$mode" ] || [ "$mode" = range ] || orb_die 'Choose either --last or --from/--to.' 2
      mode=range
      from_ref=$1
      ;;
    --to)
      orb_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || orb_die '--to requires a Git reference.' 2
      [ -z "$mode" ] || [ "$mode" = range ] || orb_die 'Choose either --last or --from/--to.' 2
      mode=range
      to_ref=$1
      ;;
    --help|-h)
      [ "$#" -eq 1 ] || orb_die 'Git commits help does not accept additional arguments.' 2
      cat <<'USAGE'
Usage:
  orbu git commits --last
  orbu git commits --from <ref> --to <ref>

Validate non-merge history using Commitlint and the repository Conventional
Commits policy. For a merge HEAD, --last validates the changes introduced
relative to its first parent; merge envelopes are not linted.
USAGE
      exit 0
      ;;
    *) orb_die "Unknown git commits option: $1" 2 ;;
  esac
  shift
done

orb_need pnpm
orb_need git
orb_git_checkout || orb_die 'Commit history validation must run inside the Orbu checkout.'
cd "$ORB_PROJECT_ROOT"

case "$mode" in
  last) orb_lint_commit_history last ;;
  range)
    [ -n "$from_ref" ] && [ -n "$to_ref" ] || orb_die 'Both --from and --to are required.' 2
    orb_lint_commit_history range "$from_ref" "$to_ref"
    ;;
  *) orb_die 'Usage: orbu git commits --last | --from <ref> --to <ref>' 2 ;;
esac
