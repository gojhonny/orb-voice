---
name: voice-engineering
description: Use when changing speech playback, voice adapters, language selection, talk flows, cancellation, speaking events, provider boundaries, or voice-engine integration.
---

# Orbu voice engineering procedure

1. Define who owns copy, locale, credentials, playback activation, and cancellation.
2. Keep direct speech gated by non-blank `speech` plus explicit `startTalking()`.
3. Preserve `pt-BR` as the Web Speech default unless a new ADR supersedes it.
4. Treat language selection as pronunciation configuration, not translation.
5. Stop prior provider work before starting a new utterance and ignore stale completions.
6. Emit speaking and error events once per meaningful transition without secret data.
7. Test with deterministic voice and synthesis fakes; verify actual browser behavior for Web Speech changes.
8. Document any new adapter option and compatibility commitment.

Never include API keys, hidden auto-start, persona text, or provider-specific
assumptions in the element core.
