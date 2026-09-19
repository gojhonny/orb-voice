#!/bin/sh
set -eu
. "$ORB_CLI_DIR/core/common.sh"

staged=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    --staged) staged=true ;;
    --help|-h)
      [ "$#" -eq 1 ] || orb_die 'Version-check help does not accept additional arguments.' 2
      printf 'Usage: orbv git version-check [--staged]\n'
      exit 0
      ;;
    *) orb_die "Unknown version-check option: $1" 2 ;;
  esac
  shift
done

orb_need node
orb_need pnpm
cd "$ORB_PROJECT_ROOT"

read_version() {
  node -e "const fs=require('node:fs');const p=JSON.parse(fs.readFileSync(0,'utf8'));if(typeof p.version!=='string')process.exit(1);process.stdout.write(p.version)"
}

package_source=package.json
package_changed=false

if [ "$staged" = true ]; then
  orb_need git
  orb_git_checkout || orb_die 'Staged version validation must run inside the OrbV checkout.'

  if git diff --cached --name-status -- package.json | grep -E '^D[[:space:]]' >/dev/null 2>&1; then
    orb_die 'The staged change deletes package.json.'
  fi

  current_version=$(git show :package.json | read_version) ||
    orb_die 'The staged package.json is invalid JSON or has no version.'
  package_source='staged package.json'

  if git diff --cached --name-only --diff-filter=ACMR -- package.json | grep -Fx package.json >/dev/null 2>&1; then
    package_changed=true
  fi
else
  current_version=$(read_version <package.json) ||
    orb_die 'package.json is invalid JSON or has no version.'
fi

normalized_version=$(pnpm exec semver "$current_version" 2>/dev/null | sed -n '1p')
[ "$normalized_version" = "$current_version" ] ||
  orb_die "$package_source version is not canonical SemVer: $current_version"
orb_print_success "$package_source uses canonical SemVer $current_version"

if [ "$staged" = true ] && [ "$package_changed" = true ] && git cat-file -e HEAD:package.json 2>/dev/null; then
  previous_version=$(git show HEAD:package.json | read_version) ||
    orb_die 'HEAD package.json has no valid version.'
  previous_normalized=$(pnpm exec semver "$previous_version" 2>/dev/null | sed -n '1p')
  [ "$previous_normalized" = "$previous_version" ] ||
    orb_die "HEAD package version is not canonical SemVer: $previous_version"

  if [ "$current_version" != "$previous_version" ]; then
    greater=$(pnpm exec semver "$current_version" -r ">$previous_version" 2>/dev/null | sed -n '1p')
    [ "$greater" = "$current_version" ] ||
      orb_die "Package version must move forward: $previous_version -> $current_version"
    orb_print_success "package version moves forward: $previous_version -> $current_version"
  fi
fi
