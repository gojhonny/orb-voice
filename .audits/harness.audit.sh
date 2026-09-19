#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

for directory in .agents .agents/context .agents/adrs .agents/rules .agents/specs .agents/prompts .agents/skills .agents/workflows .audits; do
  if [ -f "$directory/readme.md" ]; then pass "$directory/readme.md"; else fail "missing $directory/readme.md"; fi
done

missing_readmes=$(find .agents .audits -type d ! -exec test -f '{}/readme.md' ';' -print)
if [ -n "$missing_readmes" ]; then
  printf '%s\n' "$missing_readmes" >&2
  fail 'one or more harness directories have no readme.md'
else
  pass 'every harness directory has readme.md'
fi

adr_count=$(find .agents/adrs -type f -name '[0-9][0-9][0-9][0-9]-*.adr.md' | wc -l | tr -d ' ')
spec_count=$(find .agents/specs -type f -name '[0-9][0-9][0-9]-*.spec.md' | wc -l | tr -d ' ')
rule_count=$(find .agents/rules -type f -name '[0-9][0-9][0-9]-*.rule.md' | wc -l | tr -d ' ')
[ "$adr_count" -ge 12 ] && pass "$adr_count ADRs" || fail 'expected at least 12 OrbV ADRs'
[ "$spec_count" -ge 15 ] && pass "$spec_count SPECs" || fail 'expected at least 15 OrbV SPECs'
[ "$rule_count" -ge 12 ] && pass "$rule_count rules" || fail 'expected at least 12 OrbV rules'

for record in .agents/adrs/000[1-6]-*.adr.md .agents/specs/00[1-7]-*.spec.md; do
  if grep -F 'Created: 2026-08-21' "$record" >/dev/null 2>&1 && grep -F 'Mode: Retrospective reconstruction' "$record" >/dev/null 2>&1; then
    :
  else
    fail "$record lacks the retrospective date/mode contract"
  fi
done

for record in .agents/adrs/000[7-9]-*.adr.md .agents/adrs/001[0-2]-*.adr.md .agents/specs/00[8-9]-*.spec.md .agents/specs/01[0-5]-*.spec.md; do
  if grep -F 'Created: 2026-09-04' "$record" >/dev/null 2>&1 && grep -F 'Mode: Current' "$record" >/dev/null 2>&1; then
    :
  else
    fail "$record lacks the current date/mode contract"
  fi
done
if [ "$failures" -eq 0 ]; then pass 'record dates distinguish retrospective and current work'; fi


for skill in .agents/skills/*/SKILL.md; do
  description=$(sed -n 's/^description: //p' "$skill" | head -n 1)
  if [ "$(sed -n '1p' "$skill")" = '---' ] &&
     grep -E '^name: [a-z0-9][a-z0-9-]*$' "$skill" >/dev/null 2>&1 &&
     [ "${#description}" -ge 40 ]; then
    pass "$skill activation frontmatter"
  else
    fail "$skill must declare name and a trigger-worthy description in YAML frontmatter"
  fi
done

for rule_file in .agents/rules/[0-9][0-9][0-9]-*.rule.md; do
  if [ "$(sed -n '1p' "$rule_file")" != '---' ] ||
     ! grep -F 'description:' "$rule_file" >/dev/null 2>&1; then
    fail "$rule_file lacks YAML activation frontmatter"
    continue
  fi
  if grep -F 'alwaysApply: true' "$rule_file" >/dev/null 2>&1 ||
     grep -F 'globs:' "$rule_file" >/dev/null 2>&1; then
    pass "$rule_file activation metadata"
  else
    fail "$rule_file must declare alwaysApply or globs activation metadata"
  fi
done

for workflow in regression-fix review release harness-improvement; do
  if [ -f ".agents/workflows/$workflow.md" ]; then
    pass ".agents/workflows/$workflow.md"
  else
    fail "missing .agents/workflows/$workflow.md"
  fi
done

legacy_name=$(printf '%s%s' 'ama' 'relo')
legacy_phrase=$(printf '%s%s' 'yellow' ' project')
if grep -R -n -i -E "$legacy_name|$legacy_phrase" .agents .audits cli AGENTS.md README.md package.json >/dev/null 2>&1; then
  fail 'repository harness retains unrelated product terminology'
else
  pass 'repository harness terminology is OrbV-specific'
fi

if grep -R -n -i -E 'container orchestrator|workspace task graph|product changelog|environment template' .agents cli >/dev/null 2>&1; then
  fail 'repository harness retains unrelated application assumptions'
else
  pass 'repository harness contains no imported application assumptions'
fi

if [ -d .audit ]; then fail 'legacy .audit directory still exists'; else pass 'audit directory is .audits'; fi

for rule in 009-git-commits-and-semantic-versioning 010-colocated-tests 011-public-orb-installer 012-agent-runtime-guardrails; do
  if grep -F ".agents/rules/$rule.rule.md" AGENTS.md >/dev/null 2>&1; then pass "AGENTS reads rule $rule"; else fail "AGENTS omits rule $rule"; fi
done

if [ "$failures" -ne 0 ]; then
  printf '\n%d harness audit failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nHarness audit passed.\n'
