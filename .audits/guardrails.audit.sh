#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

if node -e '
const fs = require("node:fs")
const config = JSON.parse(fs.readFileSync(".cursor/hooks.json", "utf8"))
const names = Object.keys(config.hooks || {}).sort()
if (config.version !== 1) process.exit(1)
if (names.join(",") !== "afterFileEdit,beforeShellExecution") process.exit(1)
for (const name of names) {
  if (!Array.isArray(config.hooks[name]) || config.hooks[name].length !== 1) process.exit(1)
  if (typeof config.hooks[name][0].command !== "string") process.exit(1)
}
'; then
  pass '.cursor/hooks.json declares exactly the gate and feedback events'
else
  fail '.cursor/hooks.json is invalid or contains unexpected hook events'
fi

for script in .cursor/hooks/guard-shell.cjs .cursor/hooks/feedback-edit.cjs; do
  if [ -x "$script" ]; then pass "$script is executable"; else fail "$script must be executable"; fi
  if node --check "$script" >/dev/null 2>&1; then pass "$script parses"; else fail "$script has invalid JavaScript syntax"; fi
done

guard_permission() {
  payload=$1
  printf '%s' "$payload" | node .cursor/hooks/guard-shell.cjs | node -e '
let input=""; process.stdin.on("data", c => input += c); process.stdin.on("end", () => {
  const value = JSON.parse(input); process.stdout.write(String(value.permission || ""))
})'
}

assert_permission() {
  expected=$1
  label=$2
  payload=$3
  actual=$(guard_permission "$payload")
  if [ "$actual" = "$expected" ]; then pass "$label -> $expected"; else fail "$label expected $expected, got ${actual:-empty}"; fi
}

assert_permission allow 'ordinary command' '{"command":"git status","workspace_roots":[".'"$ROOT"'"]}'
assert_permission deny 'npm publication' '{"command":"npm publish --access public"}'
assert_permission deny 'force push' '{"command":"git push --force origin main"}'
assert_permission deny 'hard reset' '{"command":"git reset --hard HEAD~1"}'
assert_permission deny 'hook bypass' '{"command":"git commit --no-verify -m bad"}'
assert_permission ask 'normal push' '{"command":"git push origin main"}'
assert_permission ask 'tag creation' '{"command":"git tag -a v1.0.0 -m v1.0.0"}'

malformed=$(printf '%s' '{bad json' | node .cursor/hooks/guard-shell.cjs | node -e '
let input=""; process.stdin.on("data", c => input += c); process.stdin.on("end", () => {
  const value = JSON.parse(input); process.stdout.write(String(value.permission || ""))
})')
if [ "$malformed" = ask ]; then pass 'malformed gate payload fails to ask'; else fail 'malformed gate payload must return ask'; fi

feedback=$(printf '%s' '{"file_path":"../outside.ts","workspace_roots":["'"$ROOT"'"]}' | node .cursor/hooks/feedback-edit.cjs)
if [ "$feedback" = '{}' ]; then pass 'feedback hook ignores files outside workspace'; else fail 'feedback hook returned unexpected output'; fi

for workflow in regression-fix review release harness-improvement; do
  if [ -f ".agents/workflows/$workflow.md" ]; then pass "workflow $workflow"; else fail "missing workflow $workflow"; fi
done

if grep -F 'name: orbu-reviewer' .cursor/agents/orbu-reviewer.md >/dev/null 2>&1 && \
   grep -F 'description:' .cursor/agents/orbu-reviewer.md >/dev/null 2>&1; then
  pass 'Orbu reviewer subagent metadata'
else
  fail 'Orbu reviewer subagent lacks name/description metadata'
fi


if grep -F 'harness-score@1.5.2' cli/src/commands/harness.sh >/dev/null 2>&1; then
  pass 'Orbu harness command pins harness-score 1.5.2'
else
  fail 'Orbu harness command must pin harness-score 1.5.2'
fi

if grep -F 'uses: paladini/harness-score@v1' .github/workflows/harness-score.yml >/dev/null 2>&1 &&
   grep -F "version: '1.5.2'" .github/workflows/harness-score.yml >/dev/null 2>&1 &&
   grep -F "min-level: '4'" .github/workflows/harness-score.yml >/dev/null 2>&1 &&
   grep -F "badge: ''" .github/workflows/harness-score.yml >/dev/null 2>&1; then
  pass 'CI pins Harness Score 1.5.2 at L4 without badge generation'
else
  fail 'Harness Score CI gate is missing the pinned L4 configuration'
fi

if [ "$failures" -ne 0 ]; then
  printf '\n%d guardrail audit failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nGuardrail audit passed.\n'
