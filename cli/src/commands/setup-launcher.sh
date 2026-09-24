#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"

orb_require_repository_source

orb_setup_mode=manual
orb_bin_dir=${ORB_BIN_DIR:-}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --bin-dir)
      orb_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || orb_die '--bin-dir requires a directory' 2
      orb_bin_dir=$1
      ;;
    --bootstrap)
      orb_setup_mode=bootstrap
      ;;
    --launcher)
      ;;
    --help|-h)
      [ "$#" -eq 1 ] || orb_die 'Launcher setup help does not accept additional arguments.' 2
      cat <<'EOF'
Usage:
  orbo setup [--launcher] [--bin-dir <directory>]

Destination precedence:
  --bin-dir, ORB_BIN_DIR, PNPM_HOME, XDG_BIN_HOME, ~/.local/bin

Set ORB_SETUP_DISABLED=1 to skip launcher installation. Orbo never edits a
shell profile and never replaces an unmanaged file or symlink.
EOF
      exit 0
      ;;
    *) orb_die "Unknown setup option: $1" 2 ;;
  esac
  shift
done

case "${ORB_SETUP_DISABLED:-0}" in
  1|true|TRUE|yes|YES)
    printf 'Orbo launcher setup skipped: ORB_SETUP_DISABLED is set.\n'
    exit 0
    ;;
esac

if [ "$orb_setup_mode" = bootstrap ] && orb_ci_enabled; then
  printf 'Orbo launcher setup skipped in CI.\n'
  exit 0
fi

if [ -z "$orb_bin_dir" ]; then
  orb_bin_dir=$(orb_default_bin_dir 2>/dev/null || true)
fi
[ -n "$orb_bin_dir" ] || orb_die 'No user binary directory is available. Set ORB_BIN_DIR or HOME.'

mkdir -p "$orb_bin_dir" || orb_die "Cannot create binary directory: $orb_bin_dir"
orb_bin_dir=$(CDPATH= cd -P "$orb_bin_dir" && pwd)
[ -w "$orb_bin_dir" ] || orb_die "Binary directory is not writable: $orb_bin_dir"

orb_target="$orb_bin_dir/orbo"
if [ -L "$orb_target" ]; then
  orb_die "Refusing to replace symlink: $orb_target"
elif [ -e "$orb_target" ]; then
  [ -f "$orb_target" ] || orb_die "Refusing to replace non-regular path: $orb_target"
  orb_marker=$(sed -n '2p' "$orb_target" 2>/dev/null || true)
  [ "$orb_marker" = '# managed-by: orbo' ] || orb_die "Unmanaged command already exists: $orb_target"
fi

orb_tmp_dir=
orb_tmp=
orb_setup_cleanup() {
  [ -z "$orb_tmp" ] || rm -f "$orb_tmp"
  [ -z "$orb_tmp_dir" ] || rmdir "$orb_tmp_dir" 2>/dev/null || :
}
orb_setup_on_signal() {
  trap - 0 1 2 15
  orb_setup_cleanup
  exit 1
}
trap orb_setup_cleanup 0
trap orb_setup_on_signal 1 2 15

orb_tmp_attempt=0
while [ "$orb_tmp_attempt" -lt 100 ]; do
  orb_tmp_attempt=$((orb_tmp_attempt + 1))
  orb_tmp_candidate="$orb_bin_dir/.orb.tmp.$$.$orb_tmp_attempt"
  if (umask 077 && mkdir "$orb_tmp_candidate") 2>/dev/null; then
    orb_tmp_dir=$orb_tmp_candidate
    break
  fi
done
[ -n "$orb_tmp_dir" ] || orb_die "Cannot reserve temporary directory in $orb_bin_dir"
orb_tmp="$orb_tmp_dir/orbo"

orb_fallback_root=$(orb_shell_quote "$ORB_PROJECT_ROOT")
{
  cat <<'EOF'
#!/bin/sh
# managed-by: orbo
set -eu

EOF
  printf 'fallback_root=%s\n' "$orb_fallback_root"
  cat <<'EOF'

if [ ! -x "$fallback_root/cli/orbo" ]; then
  printf 'orbo: configured Orbo checkout is unavailable: %s\n' "$fallback_root" >&2
  printf 'orbo: run ./cli/orbo setup from a valid checkout\n' >&2
  exit 2
fi

exec "$fallback_root/cli/orbo" "$@"
EOF
} >"$orb_tmp"
chmod 755 "$orb_tmp"

if [ -x "$orb_target" ] && cmp -s "$orb_tmp" "$orb_target"; then
  printf 'Orbo launcher already configured at %s\n' "$orb_target"
  exit 0
fi

mv "$orb_tmp" "$orb_target"
orb_tmp=
rmdir "$orb_tmp_dir"
orb_tmp_dir=
trap - 0 1 2 15

printf 'Orbo launcher installed at %s\n' "$orb_target"
if ! orb_path_contains "$orb_bin_dir"; then
  orb_warn "$orb_bin_dir is not on PATH"
fi
