# Architecture context

## Entry points

- `orbo-voice` is side-effect free and safe to import during SSR.
- `orbo-voice/browser` registers `<orb-o>` in the active custom-element registry.
- `orbo-voice/react-types` provides type-only JSX augmentation.
- `orbo-voice/standalone` is the direct-browser bundle.
- `orbo-voice/index.css` exposes package CSS when explicitly needed.

## Runtime layers

`core/` owns appearance and motion data plus pure normalization. `element/`
owns the public element contracts and styles. `factories/` creates the closed
shadow tree and the DOM-dependent class only when a DOM exists. `services/`
owns animation, registration, and talk execution. `ports/` defines consumer
integration seams. `talk/` owns adapters, speech data, and talk types.

The shadow tree is closed and visual-only. Tests and consumers must use public
properties, attributes, methods, and events rather than private descendants.

## Dependency direction

Pure data and types do not depend on DOM services. Services depend on ports,
not provider credentials. Browser registration is isolated from the main entry
point. No framework runtime is part of the package.

## Configuration and voice selection

`src/orbo.config.json` contains editable component, palette and realtime settings.
Internal appearance, motion and speech defaults are uppercase constants in
concern-owned `.data.ts` files (ADR-0016). The pure transformer fills omitted
internal groups, validates, clones, derives runtime values and freezes them.
Legacy complete input remains accepted. Existing exports derive from the composed
runtime. Credentials, callbacks and mutable browser objects stay outside data.

NeonGate (`neongate`) is the canonical default palette, independent of GitHub
ownership. ADR-0019 preserves the accidental 1.0.1 name as a deprecated input
and non-enumerable runtime palette alias. The transformer normalizes legacy
source on its own clone; canonical enumeration still exposes six presets.

A native `voiceModel` property selects inert adapters through a service.
`OrboVoiceEnginePort` handles output-only speech; `OrboConversationPort` handles
live audio lifecycle and bounded state/transcript events. Realtime SDP setup
uses application authorization, followed by direct browser/OpenAI WebRTC.
No memory runtime, persona, framework wrapper or backend ships here (ADR-0014).
