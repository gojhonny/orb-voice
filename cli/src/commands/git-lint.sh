#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"
orb_require_repository_source

orb_lint_mode=
orb_from=
orb_to=

while [ "$#" -gt 0 ]; do
  case "$1" in
    --last)
      [ -z "$orb_lint_mode" ] || orb_die 'Choose either --last or --from/--to.' 2
      orb_lint_mode=last
      ;;
    --from)
      orb_require_option_value "$1" "${2:-}"
      [ "$orb_lint_mode" != last ] || orb_die 'Choose either --last or --from/--to.' 2
      shift
      [ "$#" -gt 0 ] || orb_die '--from requires a Git revision.' 2
      orb_from=$1
      orb_lint_mode=range
      ;;
    --to)
      orb_require_option_value "$1" "${2:-}"
      [ "$orb_lint_mode" != last ] || orb_die 'Choose either --last or --from/--to.' 2
      shift
      [ "$#" -gt 0 ] || orb_die '--to requires a Git revision.' 2
      orb_to=$1
      orb_lint_mode=range
      ;;
    --help|-h)
      [ "$#" -eq 1 ] || orb_die 'Git lint help does not accept additional arguments.' 2
      cat <<'HELP'
Usage:
  orbu git lint --last
  orbu git lint --from <revision> --to <revision>

Validate non-merge commits. For a merge HEAD, --last validates the changes
introduced relative to its first parent; merge envelopes are not linted.
HELP
      exit 0
      ;;
    *) orb_die "Unknown git lint option: $1" 2 ;;
  esac
  shift
done

[ -n "$orb_lint_mode" ] || orb_die 'Git lint requires --last or --from/--to.' 2
orb_need pnpm
cd "$ORB_PROJECT_ROOT"

case "$orb_lint_mode" in
  last) orb_lint_commit_history last ;;
  range)
    [ -n "$orb_from" ] && [ -n "$orb_to" ] || orb_die 'Git lint range requires both --from and --to.' 2
    orb_lint_commit_history range "$orb_from" "$orb_to"
    ;;
esac
