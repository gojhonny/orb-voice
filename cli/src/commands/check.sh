#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"
orb_require_repository_source

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || orb_die 'Check help does not accept additional arguments.' 2
    cat <<'HELP'
Usage: orb-voice check

Runs lint, source/test type checks, Vitest, both package builds, semantic-version
validation, and all versioned repository audits.
HELP
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || orb_die 'Check does not accept arguments.' 2 ;;
  *) orb_die "Unknown check option: $1" 2 ;;
esac

orb_run_gate() {
  orb_gate_name=$1
  shift
  printf '\n==> %s\n' "$orb_gate_name"
  "$@"
}

orb_run_gate lint "$ORB_CLI_DIR/commands/lint.sh"
orb_run_gate typecheck "$ORB_CLI_DIR/commands/typecheck.sh"
orb_run_gate test "$ORB_CLI_DIR/commands/test.sh"
orb_run_gate build "$ORB_CLI_DIR/commands/build.sh"
orb_run_gate version "$ORB_CLI_DIR/commands/git-version-check.sh"
orb_run_gate audits "$ORB_CLI_DIR/commands/audit.sh"

printf '\n'
orb_print_success 'Orb Voice check passed'
