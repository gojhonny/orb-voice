# Product context

Orb Voice is the `orb-voice` package: a framework-agnostic, SSR-safe visual
presence for AI voice experiences. It exposes one native custom element,
`<orb-voice>`, plus typed ports and optional speech adapters.

## Product boundary

The repository owns a library, not an application, documentation site, example
suite, backend, or framework wrapper. Consumers own page layout, transcripts,
conversation copy, authentication, provider credentials, and intelligence.

## Public experience

The orb-voice represents states through motion and appearance. Consumers can select a
preset or an explicit five-color palette, set size and speed, respect reduced
motion preferences, and connect speech through an adapter.

The package does not ship a persona or product-specific greeting. Silence is the
default. A consumer supplies `speech` and explicitly calls `startTalking()` for
a direct utterance, or deliberately configures a custom talk flow.
For live audio, the consumer selects a `voiceModel`, provides application-owned
session authorization through `realtimeSession`, then explicitly calls
`startConversation()`. Configuration alone never starts playback or microphone
access; the application owns transcript UI and backend provider credentials.
