#!/bin/sh
set -eu

CLI_DIR=$(CDPATH= cd -P "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -P "$CLI_DIR/../.." && pwd)

export ORB_CLI_DIR="$CLI_DIR"
export ORB_PROJECT_ROOT="$PROJECT_ROOT"

. "$CLI_DIR/core/common.sh"

orb_usage_error() {
  orb_print_error "Orb Voice: $1"
  printf "Run 'orb-voice help' for usage.\n" >&2
  exit 2
}

orb_default_command() {
  if orb_is_repository_source; then
    printf 'help\n'
  else
    printf 'setup\n'
  fi
}

while [ "${1:-}" = --logs ]; do
  ORB_LOGS=true
  export ORB_LOGS
  shift
done

if [ "$#" -eq 0 ]; then
  orb_command=$(orb_default_command)
else
  orb_command=$1
  shift
fi

while [ "${1:-}" = --logs ]; do
  ORB_LOGS=true
  export ORB_LOGS
  shift
done

orb_log "command=$orb_command"
ORB_HELP_TOPIC=$orb_command
export ORB_HELP_TOPIC

case "$orb_command" in
  help|--help|-h)
    exec "$CLI_DIR/commands/help.sh" "$@"
    ;;
  version|--version|-V)
    if [ "$#" -eq 1 ] && { [ "$1" = --help ] || [ "$1" = -h ]; }; then
      printf 'Usage: orb-voice version | --version | -V\n'
      exit 0
    fi
    [ "$#" -eq 0 ] || orb_usage_error 'Version does not accept arguments.'
    orb_version=$(orb_project_version 2>/dev/null || true)
    [ -n "$orb_version" ] || orb_die 'Unable to read the Orb Voice version.'
    printf 'orb-voice %s\n' "$orb_version"
    ;;
  setup|--setup)
    exec "$CLI_DIR/commands/setup.sh" "$@"
    ;;
  --project|--package-manager|--package-spec|--force|--dry-run)
    orb_is_repository_source && orb_usage_error "Unknown option: $orb_command"
    exec "$CLI_DIR/commands/setup.sh" "$orb_command" "$@"
    ;;
  bootstrap|install)
    orb_require_repository_source
    exec "$CLI_DIR/commands/bootstrap.sh" "$@"
    ;;
  doctor)
    orb_require_repository_source
    exec "$CLI_DIR/commands/doctor.sh" "$@"
    ;;
  cleanup|clean)
    orb_require_repository_source
    exec "$CLI_DIR/commands/cleanup.sh" "$@"
    ;;
  lint)
    orb_require_repository_source
    exec "$CLI_DIR/commands/lint.sh" "$@"
    ;;
  typecheck)
    orb_require_repository_source
    exec "$CLI_DIR/commands/typecheck.sh" "$@"
    ;;
  test)
    orb_require_repository_source
    exec "$CLI_DIR/commands/test.sh" "$@"
    ;;
  build)
    orb_require_repository_source
    exec "$CLI_DIR/commands/build.sh" "$@"
    ;;
  harness|neon)
    orb_require_repository_source
    exec "$CLI_DIR/commands/harness.sh" "$@"
    ;;
  audit)
    orb_require_repository_source
    exec "$CLI_DIR/commands/audit.sh" "$@"
    ;;
  check)
    orb_require_repository_source
    exec "$CLI_DIR/commands/check.sh" "$@"
    ;;
  git)
    orb_require_repository_source
    orb_subcommand=${1:-}
    if [ "$#" -gt 0 ]; then
      shift
    fi
    while [ "${1:-}" = --logs ]; do
      ORB_LOGS=true
      export ORB_LOGS
      shift
    done
    orb_log "git subcommand=$orb_subcommand"
    ORB_HELP_TOPIC="git${orb_subcommand:+ $orb_subcommand}"
    case "$orb_subcommand" in
      ''|help|--help|-h) exec "$CLI_DIR/commands/help.sh" git "$@" ;;
      setup) exec "$CLI_DIR/commands/git-setup.sh" "$@" ;;
      doctor) exec "$CLI_DIR/commands/git-doctor.sh" "$@" ;;
      pre-commit) exec "$CLI_DIR/commands/git-pre-commit.sh" "$@" ;;
      commit-message|commit-msg) exec "$CLI_DIR/commands/git-commit-msg.sh" "$@" ;;
      lint) exec "$CLI_DIR/commands/git-lint.sh" "$@" ;;
      commits) exec "$CLI_DIR/commands/git-commits.sh" "$@" ;;
      commit)
        case "${1:-}" in
          ''|help|--help|-h) exec "$CLI_DIR/commands/help.sh" git commit "$@" ;;
          message) ;;
          *) orb_usage_error 'Usage: orb-voice git commit message <message-file>' ;;
        esac
        shift
        ORB_HELP_TOPIC='git commit-message'
        while [ "${1:-}" = --logs ]; do
          ORB_LOGS=true
          export ORB_LOGS
          shift
        done
        exec "$CLI_DIR/commands/git-commit-msg.sh" "$@"
        ;;
      version-check) exec "$CLI_DIR/commands/git-version-check.sh" "$@" ;;
      *) orb_usage_error 'Usage: orb-voice git <setup|doctor|pre-commit|commit-message|lint|commits|version-check>' ;;
    esac
    ;;
  --*) orb_usage_error "Unknown option: $orb_command" ;;
  *) orb_usage_error "Unknown command: $orb_command" ;;
esac
