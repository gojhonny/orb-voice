#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }
require_file() { if [ -f "$1" ]; then pass "$1"; else fail "missing $1"; fi; }
require_dir() { if [ -d "$1" ]; then pass "$1/"; else fail "missing $1/"; fi; }

for directory in \
  src/core/appearance \
  src/core/lib \
  src/core/motion \
  src/element \
  src/factories \
  src/ports \
  src/services \
  src/talk
do
  require_dir "$directory"
done

for path in \
  src/orbo.config.json \
  src/core/config.data.ts \
  src/core/appearance/appearance.types.ts \
  src/core/appearance/merge-colors.compute.ts \
  src/core/motion/motion.data.ts \
  src/core/motion/motion.types.ts \
  src/talk/talk.data.ts \
  src/factories/element-class.factory.ts
do
  require_file "$path"
done

if [ -e src/core/core.data.ts ]; then
  fail 'legacy src/core/core.data.ts remains; canonical configuration is src/orbo.config.json'
else
  pass 'configuration uses src/orbo.config.json with typed compatibility bindings'
fi

legacy_core_files='appearance.types.ts is-preset-name.guard.ts is-reduced-motion.guard.ts is-state.guard.ts merge-colors.compute.ts motion.data.ts motion.types.ts normalize-preset.compute.ts normalize-reduced-motion.compute.ts normalize-size.compute.ts normalize-speed.compute.ts normalize-state.compute.ts'
for name in $legacy_core_files; do
  if [ -e "src/core/$name" ]; then
    fail "legacy flat core file remains: src/core/$name"
  fi
done

if grep -R -n -E "@core/(appearance\.types|merge-colors\.compute|motion\.(data|types)|is-(preset-name|reduced-motion|state)\.guard|normalize-[a-z-]+\.compute)" src >/dev/null 2>&1; then
  fail 'source references removed flat @core paths'
else
  pass 'core imports use concern paths'
fi

if find src \( -type f -o -type d \) -name 'orbo*' ! -path src/orbo.config.json -print | grep . >/dev/null 2>&1; then
  fail 'a source path begins with orbo outside the canonical JSON exception'
else
  pass 'source paths use responsibility names with the canonical JSON exception'
fi

if find src -type f \( -iname '*react*component*' -o -iname '*vue*' -o -iname '*svelte*' -o -iname '*angular*' \) -print | grep . >/dev/null 2>&1; then
  fail 'framework runtime source detected'
else
  pass 'no framework runtime wrapper source'
fi

if grep -F 'orboConfiguration.component.observedAttributes' src/element/element.data.ts >/dev/null 2>&1 &&
  grep -F '"speech"' src/orbo.config.json >/dev/null 2>&1; then
  pass 'element observed attributes derive from canonical configuration'
else
  fail 'element observed attributes must derive from canonical configuration including speech'
fi

if grep -F 'DEFAULT_SPEECH_LANGUAGE = orboConfiguration.speech.webSpeech.language' src/talk/talk.data.ts >/dev/null 2>&1 &&
  grep -F "language: 'pt-BR'" src/talk/default-speech.data.ts >/dev/null 2>&1; then
  pass 'Web Speech default language derives from canonical pt-BR configuration'
else
  fail 'default speech language must derive from canonical pt-BR configuration'
fi

if grep -E 'talk:[[:space:]]*\{[[:space:]]*\}' src/talk/default-speech.data.ts >/dev/null 2>&1 &&
  grep -E 'defaultTalkFlow:[[:space:]]*\[[[:space:]]*\]' src/talk/default-speech.data.ts >/dev/null 2>&1; then
  pass 'canonical default talk data contains no packaged conversation copy'
else
  fail 'canonical default talk data must be an empty record and empty flow'
fi

if [ "$failures" -ne 0 ]; then
  printf '\n%d architecture audit failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nArchitecture audit passed.\n'
