# Voice and localization context

Speech and conversations are opt-in and owned by the consumer.

- `speech` contains direct utterance text; `voiceEngine` implements `speak()` and `stop()`.
- `startTalking()` activates output-only speech or a consumer-authored talk flow.
- `voiceModel` selects Web Speech, OpenAI speech or OpenAI Realtime through a typed native property.
- An explicitly assigned `voiceEngine` overrides `voiceModel`; clear it before starting a Realtime conversation.
- `realtimeSession` is a consumer endpoint or SDP authorization callback. Permanent keys remain on its server.
- `startConversation()` activates direct browser/provider WebRTC; stop and interrupt are separate explicit methods.
- Assigning properties, constructing adapters and reading JSON defaults never start media or network work.
- Missing or blank output-only `speech` produces no default utterance.

Realtime model/voice defaults live in `src/orbv.config.json`; language and
output-only speech defaults live in `src/talk/default-speech.data.ts`. The
transformer composes both into the runtime configuration (ADR-0016). Web Speech
defaults to `pt-BR`; consumers may choose another BCP 47 language. The OpenAI speech
adapter accepts consumer delivery instructions. Realtime session instructions,
transcription, VAD, tools and context belong to the application server.

OrbV does not invent fallback copy, greetings or persona. An explicitly started
Realtime model generates conversation under the application's configuration.
The component emits bounded text/state events, while applications own visible
transcripts, captions, consent, memory forwarding, and language switching.

See ADR-0014 and SPEC-018 for lifecycle, authorization and pending live validation.

ADR-0015/SPEC-021 make credential ownership explicit. No key/token property or
voice configuration attribute exists. The session setter and direct adapter
validate only public endpoint/fetch-policy options; callbacks return SDP.
Application session cookies may be sent automatically by the browser, while
permanent provider keys remain server-side. A JavaScript element reference is
not separate secret storage and does not defend against compromised page scripts.
