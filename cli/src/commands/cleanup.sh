#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"

include_dependencies=true
explicit_dependencies=false
keep_dependencies=false
dry_run=false
show_help=false
argument_count=$#
while [ "$#" -gt 0 ]; do
  case "$1" in
    --dependencies) explicit_dependencies=true ;;
    --keep-dependencies) keep_dependencies=true ;;
    --dry-run) dry_run=true ;;
    --help|-h) show_help=true ;;
    *) orb_die "Unknown cleanup option: $1" 2 ;;
  esac
  shift
done

[ "$explicit_dependencies" = false ] || [ "$keep_dependencies" = false ] ||
  orb_die '--dependencies and --keep-dependencies cannot be combined.' 2

if [ "$show_help" = true ]; then
  [ "$argument_count" -eq 1 ] || orb_die 'Cleanup help does not accept additional arguments.' 2
  cat <<'EOF'
Usage: orbu cleanup [--keep-dependencies | --dependencies] [--dry-run]

Remove untracked root and nested dependencies, generated output and artifacts.
  --keep-dependencies  Preserve every node_modules directory and symlink
  --dependencies       Compatibility option; dependency removal is the default
  --dry-run            Show removal targets without changing the checkout

Requires a readable Git checkout, but no Node.js or package manager.
Tracked paths, source, assets, harness metadata and nested repositories are
protected. Symlink destinations are never followed. Restore dependencies with
'orbu bootstrap' after the default cleanup.
EOF
  exit 0
fi

[ "$keep_dependencies" = false ] || include_dependencies=false
orb_need git
orb_need find
orb_need rm
cleanup_checkout=$(git -C "$ORB_PROJECT_ROOT" rev-parse --is-inside-work-tree) ||
  orb_die 'Cleanup requires a readable Git checkout to protect tracked paths.'
[ "$cleanup_checkout" = true ] || orb_die 'Cleanup requires a Git working tree.'
# Fail before any mutation if the index cannot be inspected.
git --literal-pathspecs -C "$ORB_PROJECT_ROOT" ls-files >/dev/null ||
  orb_die 'Unable to inspect tracked paths; cleanup was not started.'

remove_path() (
  cleanup_path=$1
  cleanup_relative=$(orb_rel "$cleanup_path")
  cleanup_tracked=$(git --literal-pathspecs -C "$ORB_PROJECT_ROOT" ls-files -- "$cleanup_relative") ||
    orb_die "Unable to inspect tracked paths under $cleanup_relative."
  if [ -n "$cleanup_tracked" ]; then
    printf 'protected tracked path %s\n' "$cleanup_relative"
    return 0
  fi

  if [ ! -L "$cleanup_path" ] && [ -d "$cleanup_path" ]; then
    # Inspect whole targets before rm: a generated parent may contain another
    # repository, worktree metadata or harness. find never follows symlinks.
    cleanup_protected=$(find "$cleanup_path" \
      \( -name .git -o -name .agents -o -name .audits \) -prune -print) ||
      orb_die "Unable to inspect protected state under $cleanup_relative."
    if [ -n "$cleanup_protected" ]; then
      printf 'protected repository or harness path %s\n' "$cleanup_relative"
      return 0
    fi
    if [ "${cleanup_path##*/}" != node_modules ]; then
      # Dependencies own their source/assets. Elsewhere those names remain
      # protected, even below a directory normally used for generated output.
      cleanup_protected=$(find "$cleanup_path" -name node_modules -prune \
        -o \( -name src -o -name assets \) -prune -print) ||
        orb_die "Unable to inspect source and assets under $cleanup_relative."
      if [ -n "$cleanup_protected" ]; then
        printf 'protected source or asset path %s\n' "$cleanup_relative"
        return 0
      fi
    fi
    if [ "$include_dependencies" = false ]; then
      cleanup_dependencies=$(find "$cleanup_path" -name node_modules -prune -print) ||
        orb_die "Unable to inspect dependencies under $cleanup_relative."
      if [ -n "$cleanup_dependencies" ]; then
        # Clean eligible children while retaining dependencies in an output
        # parent; deleting the parent wholesale would violate the option.
        cleanup_walk "$cleanup_path" true || return "$?"
        return 0
      fi
    fi
  fi

  if [ "$dry_run" = true ]; then
    printf 'would remove %s\n' "$cleanup_relative"
  elif rm -rf "$cleanup_path"; then
    printf 'removed %s\n' "$cleanup_relative"
  else
    cleanup_status=$?
    orb_die "Unable to remove $cleanup_relative." "$cleanup_status"
  fi
)

cleanup_walk() (
  cleanup_directory=$1
  cleanup_generated=${2:-false}
  [ -r "$cleanup_directory" ] && [ -x "$cleanup_directory" ] ||
    orb_die "Unable to read directory $(orb_rel "$cleanup_directory")."
  # Quoted glob results are passed directly, so spaces and newline characters
  # are never parsed as filename delimiters. Subshells isolate recursive state.
  for cleanup_path in "$cleanup_directory"/* "$cleanup_directory"/.[!.]* "$cleanup_directory"/..?*; do
    [ -e "$cleanup_path" ] || [ -L "$cleanup_path" ] || continue
    cleanup_name=${cleanup_path##*/}
    case "$cleanup_name" in
      .git|.agents|.audits|src|assets) continue ;;
    esac
    if [ ! -L "$cleanup_path" ] && [ -d "$cleanup_path" ] && \
      { [ -e "$cleanup_path/.git" ] || [ -L "$cleanup_path/.git" ]; }; then
      printf 'protected nested repository %s\n' "$(orb_rel "$cleanup_path")"
      continue
    fi
    case "$cleanup_name" in
      node_modules)
        [ "$include_dependencies" = true ] || continue
        if [ -d "$cleanup_path" ] || [ -L "$cleanup_path" ]; then
          remove_path "$cleanup_path" || return "$?"
          continue
        fi
        ;;
      dist|coverage|.vitest|.cache|build|out)
        if [ -d "$cleanup_path" ] || [ -L "$cleanup_path" ]; then
          remove_path "$cleanup_path" || return "$?"
          continue
        fi
        ;;
      *.tsbuildinfo|*.tgz)
        if [ -f "$cleanup_path" ] || [ -L "$cleanup_path" ]; then
          remove_path "$cleanup_path" || return "$?"
          continue
        fi
        ;;
    esac
    if [ "$cleanup_generated" = true ]; then
      remove_path "$cleanup_path" || return "$?"
    elif [ ! -L "$cleanup_path" ] && [ -d "$cleanup_path" ]; then
      cleanup_walk "$cleanup_path" || return "$?"
    fi
  done
)

cleanup_walk "$ORB_PROJECT_ROOT"
