#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"

if [ "$#" -gt 0 ]; then
  orb_help_command=$1
  shift
  case "$orb_help_command" in
    git)
      orb_require_repository_source
      orb_help_subcommand=${1:-}
      [ "$#" -eq 0 ] || shift
      case "$orb_help_subcommand" in
        ''|help|--help|-h)
          [ "$#" -eq 0 ] || orb_die 'Usage: orb-voice help git [subcommand]' 2
          cat <<'EOF_GIT'
Usage: orb-voice git [--logs] <command> [--logs] [arguments]

Commands:
  setup                         Install Husky hook adapters
  doctor [--ci]                 Diagnose repository Git tooling
  pre-commit                    Run staged-file and SemVer gates
  commit-message <file>         Validate a Conventional Commit message
  lint --last                   Validate the latest commit
  lint --from <rev> --to <rev>   Validate a commit range
  version-check [--staged]      Validate package semantic versioning

Aliases:
  commit-msg <file>, commit message <file>  Same as commit-message
  commits [arguments]                      Same commit-history validation as lint

Run 'orb-voice help git <command>' or 'orb-voice git <command> --help' for details.
EOF_GIT
          exit 0
          ;;
        commit)
          case "${1:-}" in
            message|help|--help|-h) shift ;;
          esac
          [ "$#" -eq 0 ] || orb_die 'Usage: orb-voice help git commit [message]' 2
          printf 'Usage: orb-voice git commit message <message-file>\n'
          exit 0
          ;;
        setup|doctor|pre-commit|commit-message|commit-msg|lint|commits|version-check)
          [ "$#" -eq 0 ] || orb_die "Usage: orb-voice help git $orb_help_subcommand" 2
          exec "$ORB_CLI_DIR/orb.sh" git "$orb_help_subcommand" --help
          ;;
        *) orb_die "Unknown git help topic: $orb_help_subcommand. Run 'orb-voice help git'." 2 ;;
      esac
      ;;
    bootstrap|install|setup|--setup|doctor|cleanup|clean|lint|typecheck|test|build|harness|neon|audit|check|version|--version|-V)
      [ "$#" -eq 0 ] || orb_die "Usage: orb-voice help $orb_help_command" 2
      exec "$ORB_CLI_DIR/orb.sh" "$orb_help_command" --help
      ;;
    help|--help|-h)
      [ "$#" -eq 0 ] || orb_die 'Usage: orb-voice help [command]' 2
      ;;
    *) orb_die "Unknown help topic: $orb_help_command. Run 'orb-voice help'." 2 ;;
  esac
fi

orb_print_logo

if ! orb_is_repository_source; then
  cat <<'EOF_PUBLIC'
Orb Voice project installer

Usage:
  npx orb-voice --setup
  orb-voice setup [options]

Options:
  --setup                               Same as setup; the canonical consumer form
  --project <directory>                 Target project; defaults to the current directory
  --package-manager <npm|pnpm|yarn|bun> Override package-manager detection
  --package-spec <specifier>            Override the Orb Voice package/version to install
  --force                               Reinstall even when Orb Voice is already declared
  --dry-run                             Print the installation command without executing it
  --logs                                Print operational diagnostics to stderr
  --help, -h                            Show this guide
  --version, -V                         Print the executing Orb Voice version

The default command is setup. It adds orb-voice to an existing project
and prints the framework-neutral registration snippet. It does not generate or
overwrite application source files.
EOF_PUBLIC
  exit 0
fi

cat <<'EOF_REPOSITORY'
Orb Voice repository engineering CLI

Usage:
  orb-voice [--logs] <command> [arguments]
  ./cli/orb-voice <command> [arguments]
  orb-voice help <command>
  orb-voice help git <command>

Commands:
  help [command]                        Show this guide or command-specific help
  --version                             Print the local Orb Voice/Orb Voice version
  bootstrap                             Install dependencies and configure the checkout
  setup [--launcher] [--bin-dir <dir>]  Install the user-scoped orb-voice launcher
  setup --project <dir> [options]       Install Orb Voice into an existing consumer project
  doctor [--ci]                         Diagnose the Orb Voice engineering environment
  cleanup [options]                     Remove generated state and dependencies
  lint [--write|--staged]               Run Biome or staged-file checks
  typecheck                             Type-check source and colocated tests
  test [--watch|--coverage] [args]      Run Vitest
  build                                 Build package and standalone distributions
  harness [args]                        Run the external engineering harness tool
  audit                                 Run every versioned repository audit
  check                                 Run the complete release quality gate
  git help                              Show the Git command guide
  git setup                             Install Husky hook adapters
  git doctor [--ci]                     Diagnose Commitlint, Husky, and lint-staged
  git pre-commit                        Run staged-file and SemVer gates
  git commit-message <file>             Validate a Conventional Commit message
  git commit message <file>             Alias for git commit-message
  git lint --last                       Validate the latest commit
  git lint --from <rev> --to <rev>      Validate a commit range
  git commits --last                    Backward-compatible commit lint alias
  git version-check [--staged]          Validate package semantic versioning

Aliases:
  install       bootstrap (repository only)
  clean         cleanup
  neon          harness
  version, -V   --version
  git commit-msg <file>  git commit-message <file>

Global flags:
  --help, -h     Show this guide
  --logs         Print operational diagnostics to stderr
  --version, -V  Print the local version

Use --logs before or immediately after a command or Git subcommand.
Use '<command> --help' or 'help <command>' for command-specific options.

First checkout:
  ./cli/orb-voice bootstrap

Install only the user-scoped launcher:
  pnpm run setup

Consumer installation test:
  npx orb-voice --setup

Orb Voice is implemented entirely with POSIX shell scripts. Package commands are
owned by Orb Voice; package.json keeps only the setup bridge and npm lifecycle gates.
EOF_REPOSITORY
