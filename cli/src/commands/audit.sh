#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || orb_die 'Audit help does not accept additional arguments.' 2
    printf 'Usage: orb-voice audit\n'
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || orb_die 'Audit does not accept arguments.' 2 ;;
  *) orb_die "Unknown audit option: $1" 2 ;;
esac

found=false
LC_ALL=C
export LC_ALL
for audit_file in "$ORB_PROJECT_ROOT"/.audits/*.audit.sh; do
  [ -f "$audit_file" ] || continue
  found=true
  printf '\n==> %s\n' "$(orb_rel "$audit_file")"
  /bin/sh "$audit_file"
done

[ "$found" = true ] || orb_die 'No audits were found under .audits/.'
printf '\nAll Orb Voice audits passed.\n'
