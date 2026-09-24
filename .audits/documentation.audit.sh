#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

failures=0

pass() {
  printf 'PASS  %s\n' "$1"
}

fail() {
  printf 'FAIL  %s\n' "$1" >&2
  failures=$((failures + 1))
}

# ---------------------------------------------------------------------------
# README assets and product-first hero
# ---------------------------------------------------------------------------

for image in \
  assets/images/orbo-tagline.svg \
  assets/images/readme-banner.png
do
  if [ -s "$image" ]; then
    pass "$image exists"
  else
    fail "missing or empty $image"
  fi
done

tagline_line=$(grep -n -m1 'assets/images/orbo-tagline.svg' README.md | cut -d: -f1 || true)
banner_line=$(grep -n -m1 'assets/images/readme-banner.png' README.md | cut -d: -f1 || true)
badges_line=$(grep -n -m1 'badge-l4.svg' README.md | cut -d: -f1 || true)
product_line=$(grep -n -m1 '^## Give your AI voice a presence$' README.md | cut -d: -f1 || true)

if \
  [ -n "$tagline_line" ] &&
  [ -n "$banner_line" ] &&
  [ -n "$badges_line" ] &&
  [ -n "$product_line" ] &&
  [ "$tagline_line" -lt "$banner_line" ] &&
  [ "$banner_line" -lt "$badges_line" ] &&
  [ "$badges_line" -lt "$product_line" ]
then
  pass 'README hero leads into the product implementation guide'
else
  fail 'README hero must be tagline -> banner -> badges -> product guide'
fi

for token in \
  'paladini.github.io/harness-score/maturity/badge-l4.svg' \
  'github/actions/workflow/status/gojhonny/orbo/ci.yml' \
  'img.shields.io/npm/v/orbo-voice'
do
  if grep -F "$token" README.md >/dev/null 2>&1; then
    pass "README contains badge $token"
  else
    fail "README is missing badge $token"
  fi
done

# Keep consumer resources together. Repository engineering navigation belongs
# outside the npm-facing README.
if awk '
  BEGIN {
    expected[1] = "<a href=\"https://neongate.com.br/docs/orbz/overview\"><strong>Documentation</strong></a>"
    expected[2] = "<a href=\"https://www.npmjs.com/package/orbo-voice\"><strong>npm</strong></a>"
    expected[3] = "<a href=\"./LICENSE\"><strong>MIT License</strong></a>"
  }
  /^[[:space:]]*<p align="center">[[:space:]]*$/ {
    active = 1; count = 0; valid = 1; next
  }
  active && /<a / {
    count++
    if (count > 3 || index($0, expected[count]) == 0) valid = 0
  }
  active && /<\/p>/ {
    if (valid && count == 3) found = 1
    active = 0
  }
  END { exit(found ? 0 : 1) }
' README.md; then
  pass 'README centers Documentation, npm, and MIT License consumer links'
else
  fail 'README must center Documentation, npm, and MIT License consumer links'
fi

# ---------------------------------------------------------------------------
# Consumer implementation documentation
# ---------------------------------------------------------------------------

for heading in \
  '## Install' \
  '## Quick start' \
  '## Web Component API' \
  '### HTML attributes' \
  '### JavaScript properties' \
  '### Methods' \
  '## Voice integrations' \
  '### Browser speech' \
  '### OpenAI text-to-speech through your backend' \
  '### OpenAI Realtime' \
  '### Bring your own voice engine' \
  '## Talk flow and application intelligence' \
  '## Conversation and visual states' \
  '## Presets and custom branding' \
  '## Events' \
  '## React and Next.js' \
  '## SSR and browser registration' \
  '## Security boundary' \
  '## Accessibility' \
  '## Package entry points' \
  '## License'
do
  if grep -F -x "$heading" README.md >/dev/null 2>&1; then
    pass "README contains $heading"
  else
    fail "README is missing $heading"
  fi
done

for token in \
  'orbo-voice/browser' \
  '<orb-o' \
  voiceModel \
  realtimeSession \
  voiceEngine \
  talkFlow \
  intelligence \
  conversationState \
  talkContext \
  'startTalking()' \
  'stopTalking()' \
  'receive(input)' \
  'startConversation()' \
  'interruptConversation()' \
  'stopConversation()' \
  web-speech \
  openai-speech \
  openai-realtime \
  gpt-4o-mini-tts \
  gpt-realtime-2 \
  pt-BR \
  en-US \
  color-primary \
  reduced-motion \
  defineOrbo \
  'npx orbo-voice --setup'
do
  if grep -F "$token" README.md >/dev/null 2>&1; then
    pass "README documents consumer API token $token"
  else
    fail "README does not document consumer API token $token"
  fi
done

for value in neongate periwinkle magenta peach mocha ivory; do
  if grep -F "$value" README.md >/dev/null 2>&1; then
    pass "README documents preset $value"
  else
    fail "README does not document preset $value"
  fi
done

for value in idle listening thinking speaking asleep; do
  if grep -F "$value" README.md >/dev/null 2>&1; then
    pass "README documents state $value"
  else
    fail "README does not document state $value"
  fi
done

# ---------------------------------------------------------------------------
# Root README must not become repository-maintainer documentation
# ---------------------------------------------------------------------------

for forbidden in \
  '## Contributing' \
  '## Release review' \
  './cli/orbo bootstrap' \
  'orbo cleanup --dry-run' \
  'orbo git setup' \
  'lint-staged' \
  'Commitlint' \
  '.agents/' \
  '.audits/' \
  'Fork maintainers'
do
  if grep -F "$forbidden" README.md >/dev/null 2>&1; then
    fail "README contains repository-maintainer material: $forbidden"
  else
    pass "README excludes repository-maintainer material: $forbidden"
  fi
done

# ---------------------------------------------------------------------------
# Engineering CLI documentation: direct Orbo is canonical
# ---------------------------------------------------------------------------

for token in \
  '## Source checkout: use `orbo` directly' \
  'orbo doctor' \
  'orbo test' \
  'orbo check' \
  'pnpm:devPreinstall' \
  './cli/orbo setup --launcher'
do
  if grep -F "$token" cli/readme.md >/dev/null 2>&1; then
    pass "CLI guide documents $token"
  else
    fail "CLI guide does not document $token"
  fi
done

if grep -E 'pnpm exec[[:space:]]+orbo|npm exec --[[:space:]]+orbo' README.md cli/readme.md >/dev/null 2>&1; then
  fail 'active documentation requires a package-manager executable runner for Orbo'
else
  pass 'active documentation uses orbo directly for engineering commands'
fi

if grep -E 'pnpm (orbo|check|version:check)' README.md cli/readme.md >/dev/null 2>&1; then
  fail 'documentation retains removed package-script command aliases'
else
  pass 'documentation keeps Orbo as the engineering command surface'
fi

# ---------------------------------------------------------------------------
# Result
# ---------------------------------------------------------------------------

if [ "$failures" -ne 0 ]; then
  printf '\n%d documentation audit failure(s).\n' "$failures" >&2
  exit 1
fi

printf '\nDocumentation audit passed.\n'
