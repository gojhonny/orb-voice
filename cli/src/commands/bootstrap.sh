#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || orb_die 'Bootstrap help does not accept additional arguments.' 2
    printf 'Usage: orbv bootstrap\n'
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || orb_die 'Bootstrap does not accept arguments.' 2 ;;
  *) orb_die "Unknown bootstrap option: $1" 2 ;;
esac

orb_need node
orb_need pnpm
orb_need git

node_major=$(node -p "process.versions.node.split('.')[0]")
[ "$node_major" = 24 ] || orb_die "Node.js 24 is required; found $(node --version)."

cd "$ORB_PROJECT_ROOT"
orb_print_info 'Installing the OrbV dependency graph'
pnpm install --no-frozen-lockfile

if orb_ci_enabled; then
  orb_print_info 'Skipping Git hook activation and the user-scoped launcher in CI'
  exec "$ORB_CLI_DIR/commands/doctor.sh" --ci
fi

orb_print_info 'Configuring repository Git hooks'
"$ORB_CLI_DIR/commands/git-setup.sh"

orb_print_info 'Configuring the user-scoped orbv launcher'
"$ORB_CLI_DIR/commands/setup.sh" --bootstrap

exec "$ORB_CLI_DIR/commands/doctor.sh"
