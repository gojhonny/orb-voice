#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"

if [ "$#" -eq 1 ] && { [ "$1" = --help ] || [ "$1" = -h ]; }; then
  if orb_is_repository_source; then
    "$ORB_CLI_DIR/commands/setup-launcher.sh" --help
    printf '\n'
  fi
  exec "$ORB_CLI_DIR/commands/setup-project.sh" --help
fi

orb_setup_mode=auto
for orb_setup_argument in "$@"; do
  case "$orb_setup_argument" in
    --launcher|--bin-dir|--bootstrap)
      [ "$orb_setup_mode" != project ] || orb_die 'Launcher and project setup options cannot be combined.' 2
      orb_setup_mode=launcher
      ;;
    --project|--package-manager|--package-spec|--force|--dry-run)
      [ "$orb_setup_mode" != launcher ] || orb_die 'Launcher and project setup options cannot be combined.' 2
      orb_setup_mode=project
      ;;
  esac
done

if [ "$orb_setup_mode" = auto ]; then
  if orb_is_repository_source; then
    orb_setup_mode=launcher
  else
    orb_setup_mode=project
  fi
fi

case "$orb_setup_mode" in
  launcher) exec "$ORB_CLI_DIR/commands/setup-launcher.sh" "$@" ;;
  project) exec "$ORB_CLI_DIR/commands/setup-project.sh" "$@" ;;
  *) orb_die 'Unable to select an Orbu setup mode.' ;;
esac
