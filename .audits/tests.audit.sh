#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

for path in \
  vitest.config.ts \
  tsconfig.test.json \
  test/setup.ts \
  test/fixtures/orbo-styles.ts \
  src/index.test.ts \
  src/core/appearance/merge-colors.compute.test.ts \
  src/core/lib/normalize-preset.compute.test.ts \
  src/core/lib/normalize-reduced-motion.compute.test.ts \
  src/core/lib/normalize-size.compute.test.ts \
  src/core/lib/normalize-speed.compute.test.ts \
  src/core/lib/normalize-state.compute.test.ts \
  src/element/element.data.test.ts \
  src/factories/element-class.factory.test.ts \
  src/factories/shadow-tree.factory.test.ts \
  src/services/registration.service.test.ts \
  src/services/talk-runner.service.test.ts \
  src/talk/talk.data.test.ts \
  src/talk/openai-speech.adapter.test.ts \
  src/talk/web-speech.adapter.test.ts
do
  if [ -f "$path" ]; then pass "$path"; else fail "missing $path"; fi
done

if find test -type f -name '*.test.ts' -print | grep . >/dev/null 2>&1; then
  fail 'executable tests remain under root test/'
else
  pass 'root test/ contains support files only'
fi

outside_src=$(find . -path './node_modules' -prune -o -type f -name '*.test.ts' ! -path './src/*' -print)
if [ -n "$outside_src" ]; then
  printf '%s\n' "$outside_src" >&2
  fail 'one or more executable tests are not colocated under src/'
else
  pass 'all executable tests are colocated under src/'
fi

node <<'NODE' || failures=$((failures + 1))
const { existsSync, readFileSync } = require('node:fs')
const { dirname, join } = require('node:path')
const { execFileSync } = require('node:child_process')

const files = execFileSync('find', ['src', '-type', 'f', '-name', '*.test.ts'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
let failed = false
const allowed = new Set(['core', 'element', 'factory', 'port', 'service', 'talk'])

for (const file of files) {
  const counterpart = file.replace(/\.test\.ts$/, '.ts')
  if (!existsSync(counterpart)) {
    console.error(`FAIL  missing adjacent source counterpart for ${file}`)
    failed = true
  } else {
    console.log(`PASS  ${file} is adjacent to ${counterpart}`)
  }

  const text = readFileSync(file, 'utf8')
  const match = text.match(/describe\(\s*['"]([^'"]+)['"]/)
  const prefix = match?.[1]?.split('/')[0]
  if (!prefix || !allowed.has(prefix)) {
    console.error(`FAIL  ${file} lacks a canonical concern-prefixed describe name`)
    failed = true
  } else {
    console.log(`PASS  ${file} uses ${prefix}/ suite naming`)
  }
}

if (failed) process.exit(1)
NODE

node <<'NODE' || failures=$((failures + 1))
const { readFileSync } = require('node:fs')
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
let failed = false
for (const dependency of ['vitest', 'happy-dom', '@vitest/coverage-v8']) {
  if (pkg.devDependencies?.[dependency]) console.log(`PASS  devDependency ${dependency}`)
  else { console.error(`FAIL  missing devDependency ${dependency}`); failed = true }
}
for (const alias of ['test', 'test:watch', 'test:coverage', 'typecheck', 'build', 'check']) {
  if (!(alias in (pkg.scripts ?? {}))) console.log(`PASS  ${alias} is owned by Orbo rather than package scripts`)
  else { console.error(`FAIL  package script duplicates Orbo command: ${alias}`); failed = true }
}
if (readFileSync('cli/src/commands/test.sh', 'utf8').includes('vitest run')) {
  console.log('PASS  Orbo owns deterministic Vitest execution')
} else {
  console.error('FAIL  orbo test must run Vitest once by default')
  failed = true
}
if (failed) process.exit(1)
NODE

if grep -F "environment: 'happy-dom'" vitest.config.ts >/dev/null 2>&1; then pass 'Vitest defaults to happy-dom'; else fail 'Vitest must default to happy-dom'; fi
if grep -F "include: ['src/**/*.test.ts']" vitest.config.ts >/dev/null 2>&1; then pass 'Vitest discovers colocated suites'; else fail 'Vitest must discover src/**/*.test.ts'; fi
if grep -F "'src/**/*.test.ts'" vitest.config.ts >/dev/null 2>&1; then pass 'coverage excludes colocated tests'; else fail 'coverage must exclude colocated tests'; fi
if grep -F 'src/**/*.test.ts' tsconfig.json >/dev/null 2>&1; then pass 'source TypeScript excludes colocated tests'; else fail 'source TypeScript must exclude colocated tests'; fi
if grep -F '@vitest-environment node' src/index.test.ts >/dev/null 2>&1; then pass 'SSR import test uses Node'; else fail 'SSR import test must use Node'; fi
for ci_sensor in lint typecheck test build; do
  if grep -F "run: ./cli/orbo $ci_sensor" .github/workflows/ci.yml >/dev/null 2>&1; then
    pass "CI exposes Orbo $ci_sensor explicitly"
  else
    fail "CI must expose ./cli/orbo $ci_sensor as an explicit sensor step"
  fi
done
if grep -F 'run: npm pack --dry-run' .github/workflows/ci.yml >/dev/null 2>&1; then
  pass 'CI exercises npm payload and prepack gate'
else
  fail 'CI must exercise npm pack --dry-run'
fi

if [ "$failures" -ne 0 ]; then
  printf '\n%d test audit failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nTest environment audit passed.\n'
