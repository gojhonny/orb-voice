#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"

orb_target_dir=$ORB_INVOCATION_DIR
orb_package_manager=
orb_package_spec=${ORB_PACKAGE_SPEC:-}
orb_force=false
orb_dry_run=false

while [ "$#" -gt 0 ]; do
  case "$1" in
    --project)
      orb_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || orb_die '--project requires a directory.' 2
      orb_target_dir=$1
      ;;
    --package-manager)
      orb_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || orb_die '--package-manager requires npm, pnpm, yarn, or bun.' 2
      orb_package_manager=$1
      ;;
    --package-spec)
      orb_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || orb_die '--package-spec requires a package specifier.' 2
      orb_package_spec=$1
      ;;
    --force)
      orb_force=true
      ;;
    --dry-run)
      orb_dry_run=true
      ;;
    --help|-h)
      [ "$#" -eq 1 ] || orb_die 'Project setup help does not accept additional arguments.' 2
      cat <<'HELP'
Usage:
  npx orbv --setup
  orbv setup [--project <directory>] [--package-manager <manager>]
            [--package-spec <specifier>] [--force] [--dry-run]

Project setup installs orbv into an existing JavaScript project.
The package manager is selected from package.json#packageManager, lockfiles, or
npm as a fallback. No application source file is generated or overwritten.
HELP
      exit 0
      ;;
    --launcher|--bootstrap|--bin-dir)
      orb_die 'Launcher-only options cannot be used for project setup.' 2
      ;;
    *) orb_die "Unknown project setup option: $1" 2 ;;
  esac
  shift
done

[ -d "$orb_target_dir" ] || orb_die "Project directory does not exist: $orb_target_dir" 2
orb_target_dir=$(CDPATH= cd -P "$orb_target_dir" && pwd)
[ -f "$orb_target_dir/package.json" ] ||
  orb_die "No package.json found in $orb_target_dir. Initialize the project before running OrbV setup." 2

orb_need node

orb_target_name=$(node - "$orb_target_dir/package.json" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
try {
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (typeof manifest.name === 'string') process.stdout.write(manifest.name)
} catch {
  process.exit(1)
}
NODE
) || orb_die "Invalid package.json in $orb_target_dir." 2

[ "$orb_target_name" != 'orbv' ] ||
  orb_die 'Project setup cannot install OrbV into the OrbV package itself.' 2

if [ -z "$orb_package_spec" ]; then
  orb_package_version=$(orb_project_version 2>/dev/null || true)
  [ -n "$orb_package_version" ] || orb_die 'Unable to resolve the executing OrbV version.'
  orb_package_spec="orbv@$orb_package_version"
fi

case "$orb_package_spec" in
  orbv|orbv@*) ;;
  *) orb_die "Package specifier must target orbv: $orb_package_spec" 2 ;;
esac

if [ -z "$orb_package_manager" ]; then
  orb_package_manager=$(node - "$orb_target_dir/package.json" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
try {
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
  const value = typeof manifest.packageManager === 'string' ? manifest.packageManager : ''
  const manager = value.split('@')[0]
  if (['npm', 'pnpm', 'yarn', 'bun'].includes(manager)) process.stdout.write(manager)
} catch {
  process.exit(0)
}
NODE
)
fi

if [ -z "$orb_package_manager" ]; then
  if [ -f "$orb_target_dir/pnpm-lock.yaml" ]; then
    orb_package_manager=pnpm
  elif [ -f "$orb_target_dir/yarn.lock" ]; then
    orb_package_manager=yarn
  elif [ -f "$orb_target_dir/bun.lock" ] || [ -f "$orb_target_dir/bun.lockb" ]; then
    orb_package_manager=bun
  elif [ -f "$orb_target_dir/package-lock.json" ]; then
    orb_package_manager=npm
  else
    case "${npm_config_user_agent:-}" in
      pnpm/*) orb_package_manager=pnpm ;;
      yarn/*) orb_package_manager=yarn ;;
      bun/*) orb_package_manager=bun ;;
      *) orb_package_manager=npm ;;
    esac
  fi
fi

case "$orb_package_manager" in
  npm|pnpm|yarn|bun) ;;
  *) orb_die "Unsupported package manager: $orb_package_manager" 2 ;;
esac

orb_existing_dependency=$(node - "$orb_target_dir/package.json" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
const value = manifest.dependencies?.['orbv']
if (typeof value === 'string') process.stdout.write(value)
NODE
) || orb_die "Invalid package.json in $orb_target_dir." 2

if [ -n "$orb_existing_dependency" ] && [ "$orb_force" = false ]; then
  orb_print_success "orbv is already a project dependency ($orb_existing_dependency)"
else
  if [ "$orb_dry_run" = false ]; then
    orb_need "$orb_package_manager"
  fi

  orb_print_info "Installing $orb_package_spec with $orb_package_manager in $orb_target_dir"
  if [ "$orb_dry_run" = true ]; then
    case "$orb_package_manager" in
      npm) printf 'cd %s && npm install --save %s\n' "$orb_target_dir" "$orb_package_spec" ;;
      pnpm) printf 'cd %s && pnpm add %s\n' "$orb_target_dir" "$orb_package_spec" ;;
      yarn) printf 'cd %s && yarn add %s\n' "$orb_target_dir" "$orb_package_spec" ;;
      bun) printf 'cd %s && bun add %s\n' "$orb_target_dir" "$orb_package_spec" ;;
    esac
    exit 0
  fi

  cd "$orb_target_dir"
  case "$orb_package_manager" in
    npm) npm install --save "$orb_package_spec" ;;
    pnpm) pnpm add "$orb_package_spec" ;;
    yarn) yarn add "$orb_package_spec" ;;
    bun) bun add "$orb_package_spec" ;;
  esac
fi

orb_recorded_dependency=$(node - "$orb_target_dir/package.json" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
const value = manifest.dependencies?.['orbv']
if (typeof value === 'string') process.stdout.write(value)
NODE
) || orb_die "Invalid package.json after $orb_package_manager setup." 2
[ -n "$orb_recorded_dependency" ] ||
  orb_die "$orb_package_manager completed without adding orbv to dependencies."

orb_print_success "OrbV project setup completed ($orb_recorded_dependency)"
cat <<'NEXT'

Next step:

  import 'orbv/browser'

  <orb-v preset="neongate" state="idle"></orb-v>

Speech remains opt-in. Assign speech and a voiceEngine, then call startTalking().
NEXT
