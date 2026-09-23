---
description: Scopes explicit speech, pt-BR defaults, voice adapters, talk-flow behavior, cancellation, events, and provider-boundary constraints.
globs:
  - "src/talk/**"
  - "src/services/talk-runner.service.ts"
  - "src/factories/element-class.factory.ts"
  - "README.md"
---
# Rule 005: Voice and speech behavior

- Effective: 2026-08-21
- Priority: Critical
- Applies: `src/talk/**`, talk service, element speech API

1. OrbV is silent until explicit activation: `startTalking()` uses consumer speech/custom flow; `startConversation()` activates a selected Realtime provider under consumer-owned session configuration (ADR-0014).
2. Assigning `speech`, `voiceEngine`, `talkFlow`, `voiceModel`, or `realtimeSession`, and loading JSON defaults must never autoplay or access the microphone.
3. Blank `speech` is normalized to absence and produces no utterance.
4. `WebSpeechAdapter` defaults to `pt-BR`; consumers may override its language.
5. OrbV never invents fallback copy or persona. Realtime output may be generated only through an explicitly started provider session; the application owns its instructions, tools, context and translation policy.
6. The package default talk flow is empty and contains no mocked phrases.
7. Stop or supersede stale speech runs deterministically.
8. Dispatch public speaking and error events without exposing provider secrets.
9. Provider adapters depend on consumer authorization, never embedded secrets. Permanent OpenAI keys stay server-side; Realtime audio travels directly between browser and provider.
10. Keep output-only speech and live conversation behind separate ports. Stop/supersede/disconnect release media and fence stale events; do not automatically reconnect or retry paid work.
11. Never add key/token/secret fields to element properties, HTML attributes or JSON. Validate and copy session endpoint options before retention at both component and adapter boundaries; `credentials` means Fetch policy only (ADR-0015).
12. Browser instance references and private fields are not credential vaults. Permanent provider keys stay exclusively server-side; consumer callbacks authorize sessions and return SDP, not credentials.
