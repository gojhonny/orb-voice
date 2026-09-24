#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

for path in \
  cli/orbu \
  cli/readme.md \
  cli/src/orb.sh \
  cli/src/core/common.sh \
  cli/src/core/output.sh \
  cli/src/core/shell-syntax.sh \
  cli/src/commands/bootstrap.sh \
  cli/src/commands/setup.sh \
  cli/src/commands/setup-launcher.sh \
  cli/src/commands/setup-project.sh \
  cli/src/commands/doctor.sh \
  cli/src/commands/cleanup.sh \
  cli/src/commands/lint.sh \
  cli/src/commands/typecheck.sh \
  cli/src/commands/test.sh \
  cli/src/commands/build.sh \
  cli/src/commands/audit.sh \
  cli/src/commands/check.sh \
  cli/src/commands/help.sh \
  cli/src/commands/git-setup.sh \
  cli/src/commands/git-doctor.sh \
  cli/src/commands/git-pre-commit.sh \
  cli/src/commands/git-commit-msg.sh \
  cli/src/commands/git-lint.sh \
  cli/src/commands/git-version-check.sh
do
  if [ -f "$path" ]; then pass "$path"; else fail "missing $path"; fi
done

for executable in cli/orbu cli/src/orb.sh cli/src/commands/*.sh cli/src/core/shell-syntax.sh; do
  if [ -x "$executable" ]; then pass "$executable is executable"; else fail "$executable is not executable"; fi
done

shell_failures=0
for shell_file in cli/orbu cli/src/*.sh cli/src/core/*.sh cli/src/commands/*.sh; do
  if ! /bin/sh -n "$shell_file"; then
    printf 'FAIL  invalid shell syntax: %s\n' "$shell_file" >&2
    shell_failures=$((shell_failures + 1))
  fi
done
if [ "$shell_failures" -eq 0 ]; then pass 'all Orbu shell files pass /bin/sh -n'; else failures=$((failures + shell_failures)); fi

if find cli -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.ts' \) -print | grep . >/dev/null 2>&1; then
  fail 'CLI contains a non-shell implementation file'
else
  pass 'CLI implementation is shell-only'
fi

legacy_cli_name=$(printf '%s%s' 'e' 'lo')
legacy_cli_title=$(printf '%s%s' 'E' 'lo')
legacy_cli_upper=$(printf '%s%s' 'E' 'LO')

if [ -e "cli/$legacy_cli_name" ] || [ -e "cli/src/$legacy_cli_name.sh" ]; then
  fail 'legacy CLI entry points remain in cli/'
else
  pass 'legacy CLI entry points are absent'
fi

legacy_cli_pattern="(^|[^[:alnum:]_])${legacy_cli_title}([^[:alnum:]_]|$)|(^|[^[:alnum:]_])${legacy_cli_name}([^[:alnum:]_]|$)|${legacy_cli_upper}_|${legacy_cli_name}_"
if find cli .agents .audits .husky .github README.md AGENTS.md package.json .lintstagedrc.json \
  -type f ! -path '.audits/cli.audit.sh' \
  -exec grep -n -E "$legacy_cli_pattern" {} + \
  >/dev/null 2>&1; then
  fail 'legacy CLI naming remains in the active repository surface'
else
  pass 'CLI naming is consistently Orbu'
fi

if grep -R -n -i -E 'k8s|container orchestrator|workspace task graph|product changelog|environment template' cli >/dev/null 2>&1; then
  fail 'CLI retains unrelated application or infrastructure behavior'
else
  pass 'CLI scope is specific to the Orbu library'
fi

for command in bootstrap setup doctor cleanup lint typecheck test build audit check help 'git setup' 'git doctor' 'git pre-commit' 'git commit-message' 'git lint' 'git version-check'; do
  if TERM=dumb ./cli/orbu help | grep -F "$command" >/dev/null 2>&1; then
    pass "help documents $command"
  else
    fail "help does not document $command"
  fi
done

node <<'NODE' || failures=$((failures + 1))
const fs = require('node:fs')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const scripts = pkg.scripts ?? {}
const expected = ['pnpm:devPreinstall', 'prepack', 'setup']
const actual = Object.keys(scripts).sort()
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  console.error(`FAIL  package scripts must be exactly ${expected.join(', ')}; found ${actual.join(', ')}`)
  process.exit(1)
}
if (scripts['pnpm:devPreinstall'] !== './cli/orbu setup --launcher --bootstrap') {
  console.error('FAIL  pnpm:devPreinstall must provision the managed Orbu launcher')
  process.exit(1)
}
if (scripts.setup !== './cli/orbu setup --launcher') {
  console.error('FAIL  setup script must delegate to Orbu launcher setup')
  process.exit(1)
}
if (scripts.prepack !== './cli/orbu check') {
  console.error('FAIL  prepack must delegate to Orbu check')
  process.exit(1)
}
for (const forbidden of ['preinstall', 'install', 'postinstall', 'prepare']) {
  if (forbidden in scripts) {
    console.error(`FAIL  ${forbidden} must not install the repository launcher for package consumers`)
    process.exit(1)
  }
}
if (pkg.bin?.['orbu'] !== './cli/orbu' || Object.keys(pkg.bin).length !== 1) {
  console.error('FAIL  package must expose exactly one orbu binary')
  process.exit(1)
}
console.log('PASS  source install provisions Orbu while consumer lifecycle hooks stay clean')
NODE

if grep -F '# managed-by: orbu' cli/src/commands/setup-launcher.sh >/dev/null 2>&1; then
  pass 'launcher uses the Orbu-managed marker'
else
  fail 'launcher marker is not Orbu-specific'
fi

if grep -E 'pnpm exec[[:space:]]+orbu|npm exec --[[:space:]]+orbu' README.md cli/readme.md >/dev/null 2>&1; then
  fail 'active documentation requires a package-manager executable runner for Orbu'
else
  pass 'active documentation uses direct orbu commands'
fi

if grep -F '.agents' cli/src/commands/cleanup.sh >/dev/null 2>&1 && grep -F '.audits' cli/src/commands/cleanup.sh >/dev/null 2>&1; then
  pass 'cleanup protects harness directories'
else
  fail 'cleanup does not explicitly protect harness directories'
fi

if grep -F "ORB_COLOR_NEON_CYAN" cli/src/core/output.sh >/dev/null 2>&1 && \
   grep -F "ORB_COLOR_NEON_MAGENTA" cli/src/core/output.sh >/dev/null 2>&1 && \
   grep -F "ORB_COLOR_NEON_BLUE" cli/src/core/output.sh >/dev/null 2>&1; then
  pass 'terminal ORB logo defines neon cyan, magenta, and blue colors'
else
  fail 'terminal ORB logo is missing neon color channels'
fi

orb_tmp=${TMPDIR:-/tmp}/orbu-cli-audit.$$
trap 'rm -rf "$orb_tmp"' 0 1 2 15
mkdir -p "$orb_tmp/bin" "$orb_tmp/package/cli" "$orb_tmp/project" "$orb_tmp/direct-bin"
ln -s "$ROOT/cli/orbu" "$orb_tmp/bin/orbu"
if "$orb_tmp/bin/orbu" --version | grep -Fx "orbu $(node -p "require('./package.json').version")" >/dev/null 2>&1; then
  pass 'package-manager style symlink resolves the real CLI location'
else
  fail 'CLI entry point fails through a symlink'
fi

if ORB_BIN_DIR="$orb_tmp/direct-bin" CI= ./cli/orbu setup --launcher --bootstrap >/dev/null 2>&1 &&
   PATH="$orb_tmp/direct-bin:$PATH" orbu --version | grep -Fx "orbu $(node -p "require('./package.json').version")" >/dev/null 2>&1; then
  pass 'managed launcher exposes orbu directly on PATH'
else
  fail 'managed launcher does not expose a direct orbu command'
fi

cp package.json "$orb_tmp/package/package.json"
cp -R cli "$orb_tmp/package/"
cat > "$orb_tmp/project/package.json" <<'JSON'
{
  "name": "orbu-consumer-audit",
  "private": true,
  "packageManager": "pnpm@10.32.1"
}
JSON
if (cd "$orb_tmp/project" && "$orb_tmp/package/cli/orbu" --dry-run) | grep -F 'pnpm add orbu@' >/dev/null 2>&1; then
  pass 'published CLI routes directly to project setup and detects pnpm'
else
  fail 'published CLI does not select project setup correctly'
fi

cat > "$orb_tmp/project/package.json" <<'JSON'
{
  "name": "orbu-consumer-audit",
  "private": true,
  "dependencies": {
    "orbu": "^0.4.0"
  }
}
JSON
before=$(find "$orb_tmp/project" -type f -exec basename {} \; | LC_ALL=C sort)
if (cd "$orb_tmp/project" && "$orb_tmp/package/cli/orbu") >/dev/null 2>&1; then
  after=$(find "$orb_tmp/project" -type f -exec basename {} \; | LC_ALL=C sort)
  if [ "$before" = "$after" ]; then
    pass 'default published setup is idempotent and creates no source files'
  else
    fail 'default published setup created unexpected project files'
  fi
else
  fail 'default published setup fails for an existing dependency'
fi

# Exercise real commit topology: a merge-looking subject alone is not exempt.
orb_history="$orb_tmp/history"
mkdir -p "$orb_history/.agents" "$orb_history/.audits" "$orb_history/src"
cp -R cli "$orb_history/"
cp package.json commitlint.config.cjs "$orb_history/"
touch "$orb_history/tsdown.config.ts"
ln -s "$ROOT/node_modules" "$orb_history/node_modules"
git -C "$orb_history" init -q
orb_tree=$(git -C "$orb_history" mktree </dev/null)
orb_fixture_commit() {
  GIT_AUTHOR_NAME='Jonatas Sales' GIT_AUTHOR_EMAIL='sykes.echo@proton.me' \
  GIT_COMMITTER_NAME='Jonatas Sales' GIT_COMMITTER_EMAIL='sykes.echo@proton.me' \
    git -C "$orb_history" commit-tree "$orb_tree" "$@"
}
orb_base=$(printf 'chore: initial fixture\n' | orb_fixture_commit)
orb_valid=$(printf 'fix: valid introduced change\n' | orb_fixture_commit -p "$orb_base")
orb_long_body=$(printf '%0110d' 0)
orb_invalid=$(printf "Merge branch 'fixture'\n\n%s\n" "$orb_long_body" | orb_fixture_commit -p "$orb_base")
orb_good_merge=$(printf 'docs: merge valid branch\n\n%s\n' "$orb_long_body" | orb_fixture_commit -p "$orb_base" -p "$orb_valid")
orb_bad_merge=$(printf 'docs: merge invalid branch\n' | orb_fixture_commit -p "$orb_base" -p "$orb_invalid")
for orb_history_command in lint commits; do
  git -C "$orb_history" update-ref HEAD "$orb_invalid"
  if "$orb_history/cli/orbu" git "$orb_history_command" --last >"$orb_tmp/history.log" 2>&1; then
    fail "$orb_history_command accepts a non-merge with an invalid body"
  elif grep -F 'body-max-line-length' "$orb_tmp/history.log" >/dev/null 2>&1; then
    pass "$orb_history_command strictly checks a merge-looking non-merge"
  else
    fail "$orb_history_command failed for an unexpected reason"
  fi
  git -C "$orb_history" update-ref HEAD "$orb_good_merge"
  for orb_history_mode in last range; do
    if [ "$orb_history_mode" = last ]; then
      set -- --last
    else
      set -- --from "$orb_base" --to HEAD
    fi
    if "$orb_history/cli/orbu" git "$orb_history_command" "$@" >"$orb_tmp/history.log" 2>&1; then
      pass "$orb_history_command $orb_history_mode accepts an integration envelope with valid changes"
    else
      fail "$orb_history_command $orb_history_mode rejects a valid introduced history"
      cat "$orb_tmp/history.log" >&2
    fi
  done
  git -C "$orb_history" update-ref HEAD "$orb_bad_merge"
  for orb_history_mode in last range; do
    if [ "$orb_history_mode" = last ]; then
      set -- --last
    else
      set -- --from "$orb_base" --to HEAD
    fi
    if "$orb_history/cli/orbu" git "$orb_history_command" "$@" >"$orb_tmp/history.log" 2>&1; then
      fail "$orb_history_command $orb_history_mode hides an invalid introduced commit"
    elif grep -F 'body-max-line-length' "$orb_tmp/history.log" >/dev/null 2>&1; then
      pass "$orb_history_command $orb_history_mode rejects invalid introduced history"
    else
      fail "$orb_history_command $orb_history_mode failed for an unexpected reason"
    fi
  done
done

if [ "$failures" -ne 0 ]; then
  printf '\n%d CLI audit failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nCLI audit passed.\n'
