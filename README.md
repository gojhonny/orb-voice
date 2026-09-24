<p align="center">
  <img
    src="./assets/images/orbo-tagline.svg"
    alt="One native voice-presence component for every web stack."
  >
</p>

<p align="center">
  <img src="./assets/images/readme-banner.png" alt="Orbo voice presence component" width="100%">
</p>

<p align="center">
  <a href="https://paladini.io/harness-score/guide/maturity-model.html"><img alt="Harness Score L4" src="https://paladini.github.io/harness-score/maturity/badge-l4.svg" height="20"></a>
  <a href="https://github.com/gojhonny/orbo/actions/workflows/ci.yml"><img alt="Tests" src="https://img.shields.io/github/actions/workflow/status/gojhonny/orbo/ci.yml?branch=main&label=tests&logo=github" height="20"></a>
  <a href="https://www.npmjs.com/package/orbo-voice"><img alt="npm version" src="https://img.shields.io/npm/v/orbo-voice?logo=npm" height="20"></a>
</p>

<p align="center">
  <a href="https://neongate.com.br/docs/orbz/overview"><strong>Documentation</strong></a>&nbsp;&nbsp;&nbsp;
  <a href="https://www.npmjs.com/package/orbo-voice"><strong>npm</strong></a>&nbsp;&nbsp;&nbsp;
  <a href="./LICENSE"><strong>MIT License</strong></a>
</p>

<br>

## Give your AI voice a presence

Orbo is a framework-agnostic, SSR-safe Web Component for AI voice
interfaces. It gives a voice experience a visible identity through expressive
motion, conversation states, configurable palettes, and provider-neutral voice
APIs without requiring a framework-specific UI package.

Orbo renders the native `<orb-o>` element. Your application keeps ownership of
the persona, transcript UI, authentication, backend, memory, tools, quotas, and
product logic.

| Capability | What Orbo provides |
| --- | --- |
| Native Web Component | One `<orb-o>` element for React, Next.js, Vue, Svelte, Angular, vanilla JS, and mixed stacks |
| Voice output | Browser speech, application-hosted TTS, or a custom voice engine |
| Realtime voice | Built-in OpenAI Realtime browser integration with an application-owned authorization boundary |
| Bring your own model | Public model and voice selection, including provider-specific model identifiers |
| Conversation states | Idle, listening, thinking, speaking, and asleep visual states |
| Brand controls | Presets, custom palettes, size, speed, elevation, pause, and reduced motion |
| SSR safety | Core imports do not require browser globals |
| Native events | Transcript, conversation state, speaking state, and sanitized errors |
| Zero runtime dependencies | No third-party runtime library is required by the package |

<br>

## Install

```bash
npm install orbo-voice
```

Or:

```bash
pnpm add orbo-voice
```

Project setup from the published CLI:

```bash
npx orbo-voice --setup
```

<br>

## Quick start

Register `<orb-o>` from browser-only code:

```ts
import 'orbo-voice/browser'
```

Then use it as a native element:

```html
<orb-o
  role="img"
  aria-label="Voice assistant"
  preset="neongate"
  state="idle"
></orb-o>
```

For typed JavaScript access:

```ts
import type { OrboElement } from 'orbo-voice'
import 'orbo-voice/browser'

const orb = document.querySelector<OrboElement>('orb-o')!

orb.state = 'listening'
orb.size = '18rem'
orb.speed = 1.2
```

<br>

## Web Component API

### HTML attributes

| Attribute | Values | Default | Purpose |
| --- | --- | --- | --- |
| `state` | `idle`, `listening`, `thinking`, `speaking`, `asleep` | `idle` | Select the visual conversation state |
| `size` | Positive number or CSS size string | `16rem` | Control the orb dimensions |
| `speed` | Positive number | `1` | Scale animation speed |
| `speech` | String | none | Text consumed by output-only speech flows |
| `paused` | Boolean attribute | absent | Pause animation |
| `elevated` | Boolean attribute | absent | Enable elevated presentation |
| `preset` | `neongate`, `periwinkle`, `magenta`, `peach`, `mocha`, `ivory` | `neongate` | Select a bundled palette |
| `reduced-motion` | `system`, `always`, `never` | `system` | Control motion reduction |
| `color-primary` | CSS color | preset value | Override the primary color |
| `color-secondary` | CSS color | preset value | Override the secondary color |
| `color-accent` | CSS color | preset value | Override the accent color |
| `color-highlight` | CSS color | preset value | Override the highlight color |
| `color-background` | CSS color | preset value | Override the background color |

Do not combine an explicit `preset` with custom color attributes. When a preset
is selected, the preset wins and custom color attributes are ignored.

### JavaScript properties

The element exposes the same presentation controls plus the voice and
conversation APIs that should not be serialized into HTML attributes.

| Property | Type / role |
| --- | --- |
| `state` | Visual `OrboState` |
| `size` | `number | string` |
| `speed` | Animation speed multiplier |
| `paused` | Animation pause state |
| `elevated` | Elevated presentation state |
| `preset` | Bundled palette name |
| `reducedMotion` | `system | always | never` |
| `speech` | Explicit text for output-only speech |
| `voiceModel` | Public provider/model/voice selection |
| `realtimeSession` | Application-owned Realtime authorization boundary |
| `voiceEngine` | Custom or built-in output-only voice engine |
| `talkFlow` | Optional explicit multi-step talk flow |
| `intelligence` | Optional application-provided response strategy |
| `conversationState` | Read-only live conversation state |
| `talkContext` | Read-only captured talk-flow context |

### Methods

| Method | Purpose |
| --- | --- |
| `play()` | Resume animation |
| `pause()` | Pause animation |
| `restart()` | Restart animation |
| `startTalking()` | Start the configured output-only speech flow |
| `stopTalking()` | Cancel the current output-only speech flow |
| `receive(input)` | Deliver text input to the configured talk flow |
| `startConversation()` | Start a live Realtime conversation |
| `interruptConversation()` | Interrupt the current Realtime assistant response |
| `stopConversation()` | End the live Realtime conversation |

<br>

## Voice integrations

Orbo keeps visual presence and voice transport separate from your application's
persona and backend. You can use the built-in browser/TTS/Realtime integrations
or provide your own voice engine.

| Provider | Configure with | Start with | Your application supplies |
| --- | --- | --- | --- |
| `web-speech` | `voiceModel` or `WebSpeechAdapter` | `startTalking()` | Text and optional browser voice preferences |
| `openai-speech` | `voiceModel` or `OpenAISpeechAdapter` | `startTalking()` | Your audio endpoint, model/voice options, and server-side provider credential |
| `openai-realtime` | `voiceModel` + `realtimeSession` | `startConversation()` | Your session endpoint/authorizer, provider credential, instructions, tools, and policy |
| Custom | `voiceEngine` | `startTalking()` | Any implementation of `speak(text)` and `stop()` |

Selecting a model is silent. Orbo does not automatically start playback or open
a microphone session when `voiceModel`, `speech`, or `voiceEngine` changes.

### Browser speech

```ts
import {
  type OrboElement,
  WebSpeechAdapter
} from 'orbo-voice'
import 'orbo-voice/browser'

const orb = document.querySelector<OrboElement>('orb-o')!

orb.speech = 'Welcome. How can I help?'
orb.voiceEngine = new WebSpeechAdapter({
  language: 'en-US',
  rate: 1,
  pitch: 1,
  volume: 1,
  preferredVoices: ['Google US English']
})

await orb.startTalking()
```

`WebSpeechAdapter` accepts:

| Option | Purpose |
| --- | --- |
| `language` | BCP 47 language tag such as `en-US` or `pt-BR` |
| `pitch` | Browser speech pitch |
| `rate` | Browser speech rate |
| `volume` | Browser speech volume |
| `preferredVoices` | Ordered browser voice preferences |
| `voiceLoadTimeoutMs` | Maximum wait for browser voices to become available |

Language selection controls voice matching and pronunciation. Orbo does not
translate the supplied text.

### OpenAI text-to-speech through your backend

Use an application-owned endpoint so the permanent OpenAI API key never reaches
the browser:

```ts
import type { OrboElement } from 'orbo-voice'
import 'orbo-voice/browser'

const orb = document.querySelector<OrboElement>('orb-o')!

orb.speech = 'Your order is ready.'
orb.voiceModel = {
  provider: 'openai-speech',
  endpoint: '/api/voice/speech',
  model: 'gpt-4o-mini-tts',
  voice: 'marin',
  responseFormat: 'mp3'
}

await orb.startTalking()
```

The application endpoint returns audio. Public `openai-speech` options are:

| Option | Purpose |
| --- | --- |
| `endpoint` | Required application endpoint that returns speech audio |
| `model` | OpenAI speech model identifier; custom strings are accepted |
| `voice` | Supported voice identifier; custom strings are accepted |
| `responseFormat` | `aac`, `flac`, `mp3`, `opus`, or `wav` |
| `requestTimeoutMs` | Client request timeout |

The lower-level `OpenAISpeechAdapter` also supports application-endpoint fetch
options and `instructions`. Do not use its headers option to expose a permanent
provider key to browser code.

### OpenAI Realtime

```ts
import type { OrboElement } from 'orbo-voice'
import 'orbo-voice/browser'

const orb = document.querySelector<OrboElement>('orb-o')!

orb.voiceModel = {
  provider: 'openai-realtime',
  model: 'gpt-realtime-2',
  voice: 'marin'
}

orb.realtimeSession = {
  endpoint: '/api/voice/session',
  credentials: 'same-origin'
}

await orb.startConversation()
```

Public Realtime model options are:

| Option | Purpose |
| --- | --- |
| `model` | Realtime model identifier; custom strings are accepted |
| `voice` | Provider-supported voice identifier |
| `sessionTimeoutMs` | Browser-side startup timeout |

`realtimeSession` can be either an application endpoint object or an async
authorizer callback.

Endpoint form:

```ts
orb.realtimeSession = {
  endpoint: '/api/voice/session',
  credentials: 'same-origin'
}
```

Callback form:

```ts
orb.realtimeSession = async ({ sdp, model, voice, signal }) => {
  const response = await fetch('/api/voice/session', {
    method: 'POST',
    body: JSON.stringify({ sdp, model, voice }),
    headers: { 'content-type': 'application/json' },
    signal
  })

  if (!response.ok) throw new Error('Unable to create voice session')
  return response.text()
}
```

For the endpoint form, Orbo posts JSON containing `{ sdp, model, voice }` and
expects the SDP answer as text. Your server authenticates the user, enforces the
models/voices your product allows, talks to the provider with its server-side
credential, and returns the answer.

After setup, microphone and assistant audio use the provider's Realtime browser
transport. Your server remains responsible for session policy, instructions,
tools, quotas, billing rules, sideband connections, and remote cleanup.

### Bring your own voice engine

If you already have a speech provider or your own model gateway, implement the
small `OrboVoiceEnginePort` contract:

```ts
import type { OrboVoiceEnginePort } from 'orbo-voice'

class MyVoiceEngine implements OrboVoiceEnginePort {
  async speak(text: string): Promise<void> {
    // Send text to your provider and play the resulting audio.
  }

  stop(): void {
    // Cancel the active request/playback.
  }
}

orb.voiceEngine = new MyVoiceEngine()
orb.speech = 'Hello from my own voice stack.'
await orb.startTalking()
```

An explicitly assigned `voiceEngine` takes precedence over `voiceModel`. Set
`orb.voiceEngine = undefined` to return control to the selected `voiceModel`.
Starting output-only speech stops a live Realtime conversation, and starting a
Realtime conversation stops output-only speech.

<br>

## Talk flow and application intelligence

Orbo ships without a persona, greeting, fallback copy, or hidden conversation
script. If your UI needs a small explicit talk flow, provide it yourself:

```ts
orb.talkFlow = [
  {
    id: 'welcome',
    kind: 'say',
    needsAuth: false,
    text: 'Hello. What is your name?'
  },
  {
    id: 'name',
    kind: 'ask',
    needsAuth: false,
    capture: 'fullName',
    text: 'I am listening.'
  }
]

await orb.startTalking()
await orb.receive('Ana')
```

Applications can also supply an `intelligence` object whose `respond(input,
context)` method returns application-generated text. This is an integration
boundary, not an embedded Orbo LLM or credential store.

<br>

## Conversation and visual states

Visual `state` controls the orb animation:

| State | Intended signal |
| --- | --- |
| `idle` | Ambient presence before or between turns |
| `listening` | User input is being captured |
| `thinking` | The application or model is processing |
| `speaking` | Assistant audio is active |
| `asleep` | Inactive or subdued presence |

```html
<orb-o state="thinking"></orb-o>
```

When Orbo speaks through its talk API, it temporarily switches to `speaking` and
restores the previous visual state when speech completes or is cancelled.

Live Realtime sessions also expose the read-only `conversationState` property:
`idle`, `connecting`, `listening`, `thinking`, `speaking`, or `error`.

<br>

## Presets and custom branding

The default preset is **NeonGate** (`neongate`).

| Preset | Primary | Secondary | Accent | Highlight | Background |
| --- | --- | --- | --- | --- | --- |
| `neongate` | `#6C5CFF` | `#00E9FF` | `#FF4DDE` | `#FFB07A` | `#14142B` |
| `periwinkle` | `#6667AB` | `#8FB8FF` | `#E66FA9` | `#F3ECFF` | `#111226` |
| `magenta` | `#BB2649` | `#F06A82` | `#29B8A6` | `#FFDCE4` | `#250A12` |
| `peach` | `#FFBE98` | `#FF8F70` | `#D987A3` | `#FFF0E7` | `#2A1516` |
| `mocha` | `#A47864` | `#D3A17E` | `#7FA18F` | `#F2E2D7` | `#211613` |
| `ivory` | `#F0EEE9` | `#AFC7D3` | `#C8B3D4` | `#FFFFFF` | `#171A20` |

```html
<orb-o preset="peach" state="listening"></orb-o>
```

Or supply your own palette:

```html
<orb-o
  color-primary="#4F46E5"
  color-secondary="#22D3EE"
  color-accent="#F472B6"
  color-highlight="#FEF3C7"
  color-background="#0F172A"
></orb-o>
```

Presentation controls can be combined independently:

```html
<orb-o
  size="18rem"
  speed="1.2"
  reduced-motion="system"
  elevated
></orb-o>
```

Use `play()`, `pause()`, and `restart()` for imperative motion control.

<br>

## Events

Orbo dispatches native `CustomEvent` instances from the host element.

| Event | Detail |
| --- | --- |
| `orbo-conversation-state-change` | `{ state }` where state is `idle`, `connecting`, `listening`, `thinking`, `speaking`, or `error` |
| `orbo-transcript` | `{ role, text, final, itemId? }` for user/assistant transcript updates |
| `orbo-speaking-change` | `{ speaking }` for audible output transitions |
| `orbo-talk-error` | `{ error }` for sanitized built-in talk/provider errors |

```ts
orb.addEventListener('orbo-transcript', (event) => {
  const { role, text, final } = (
    event as CustomEvent<{
      role: 'user' | 'assistant'
      text: string
      final: boolean
    }>
  ).detail

  console.log({ role, text, final })
})
```

Orbo does not store transcript history, conversation memory, or audio history.
Your application decides whether and where those events are persisted.

<br>

## React and Next.js

Orbo remains a native custom element. React projects can add JSX typing without
using a wrapper component:

```ts
import 'orbo-voice/react-types'
import 'orbo-voice/browser'
```

Then:

```tsx
<orb-o
  state="listening"
  preset="neongate"
  size="18rem"
  reduced-motion="system"
  aria-label="Voice assistant"
/>
```

`voiceModel` and `realtimeSession` are also typed properties for React usage.
`className` is intentionally excluded because a host class cannot style the
closed shadow tree. Use Orbo appearance APIs for the component itself and wrap
the element when you need page-layout styling.

<br>

## SSR and browser registration

The core package is safe to import when `HTMLElement` and `customElements` are
not available:

```ts
import type { OrboElement } from 'orbo-voice'
```

Register the element only inside a browser/client boundary:

```ts
await import('orbo-voice/browser')
```

If you prefer explicit registration instead of the browser side-effect entry:

```ts
import { defineOrbo } from 'orbo-voice'

defineOrbo()
```

`defineOrbo()` defines `<orb-o>` once and safely returns without registering in
a non-browser environment.

<br>

## Security boundary

Orbo accepts public model configuration and an application authorization
boundary. It is not a credential vault.

**Keep permanent provider API keys on your server.** A JavaScript property is
not an HTML attribute, but anything delivered to browser memory can still be
read by compromised client code.

For Realtime, the endpoint form accepts only the public endpoint, Fetch cookie
policy, and an optional consumer-owned `fetch` implementation. The application
server authenticates and authorizes the user and uses its own provider key.

For application-hosted TTS, send requests to your own endpoint and let that
endpoint call the provider. Do not embed permanent provider keys in URLs,
attributes, model objects, headers shipped to the client, or custom-element
properties.

| Orbo owns | Your application owns |
| --- | --- |
| Visual presence and animation | Persona and system instructions |
| Browser-side voice interaction | User authentication and authorization |
| Public provider/model selection | Permanent provider credentials |
| Native conversation events | Transcript UI and persistence |
| Client Realtime setup | Tools, quotas, billing, and provider policy |
| Reduced-motion behavior | Long-term memory and consent policy |

<br>

## Accessibility

The animated shadow content is visual and hidden from assistive technology. The
host element gets its meaning from your application.

- For a meaningful visual identity, provide an appropriate role and accessible name.
- For a decorative Orbo, hide the host from assistive technology.
- Keep spoken content available as visible text, captions, or a transcript.
- Announce listening, thinking, speaking, and errors through application-owned status text or live regions.
- Keep `reduced-motion="system"` unless your product has an explicit user preference.
- Do not use animation or palette changes as the only way to communicate meaning.

<br>

## Package entry points

| Import | Purpose |
| --- | --- |
| `orbo-voice` | Types, constants, factories, ports, adapters, and explicit registration API |
| `orbo-voice/browser` | Main API plus automatic browser registration |
| `orbo-voice/react-types` | React JSX type augmentation |
| `orbo-voice/standalone` | Direct-browser/CDN bundle |
| `orbo-voice/index.css` | Explicit stylesheet export |

The README is intentionally focused on **using Orbo in an application**. Deeper
integration guides and API documentation are available at
[neongate.com.br/docs/orbz/overview](https://neongate.com.br/docs/orbz/overview).

<p align="center">
  <a href="https://neongate.com.br/docs/orbz/overview"><strong>Read the documentation →</strong></a>
</p>

<br>

## License

[MIT](./LICENSE) © gojhonny
