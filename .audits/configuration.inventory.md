# Configuration ownership inventory

Updated 2026-09-07 for SPEC-025 and ADR-0016. This supersedes the SPEC-020
all-defaults-in-JSON inventory; historical specifications retain their evidence.

## Authored defaults

| Owner | Binding/data | Responsibility |
| --- | --- | --- |
| `src/orbo.config.json` | `component` | Identity, states, attributes, size, speed and reduced-motion mode |
| `src/orbo.config.json` | `appearance` | Presets, color channels and attributes |
| `src/orbo.config.json` | `realtime` | Realtime model/voice, fetch policy, transport limits |
| `src/core/appearance/appearance.data.ts` | `ORBO_DEFAULT_APPEARANCE_BY_STATE` | State contrast and saturation |
| `src/core/motion/default-motion.data.ts` | `ORBO_DEFAULT_MOTION` | Full/reduced motion, easings and animated properties |
| `src/talk/default-speech.data.ts` | `ORBO_DEFAULT_SPEECH` | Model selector, empty talk/flow, token grammar, browser and TTS defaults |

The internal constants match the previous commit's removed JSON values. They
import only types and the pure deep-freeze helper, never runtime facades.
The speech selector remains null, talk remains empty and the default language
is pt-BR. TTS uses gpt-4o-mini-tts/marin; Realtime uses gpt-realtime-2/marin.
Provider credentials are never authored in any of these sources.

## Composition and compatibility

`core/lib/validate-configuration.compute.ts` clones untrusted input before
inspection. Missing internal groups receive isolated copies of their data
constants. Explicit invalid overrides fail validation, including legacy full
inputs. `core/lib/transform-configuration.compute.ts` derives color attributes,
state appearance and repeat Infinity, then freezes the complete runtime.
`core/configuration.data.ts` bundles JSON and invokes that transformer once.

| Runtime view | Composed source |
| --- | --- |
| `core/config.data.ts` component/palette constants and `config` | `orboConfiguration.component` and `.appearance` |
| `ORBO_VOICE_DEFAULTS` | `orboConfiguration.speech` and `.realtime.openai` |
| `core/motion/motion.data.ts` | `.appearance.byState`, `.motion.full` and `.motion.reduced` |
| `element/element.data.ts` | `.component.tagName` and derived `.observedAttributes` |
| `talk/talk.data.ts` | `.speech.webSpeech.language`, `.speech.talk`, `.speech.defaultTalkFlow` |
| Animation service | `.motion.animatedStyleProperties` and `.motion.easings` |
| Token resolver and voice adapters | Composed `.speech` and `.realtime` defaults |

These facades author no second set of defaults. Mutable constructor registries,
compiled token matchers, types, validation grammar, algorithms, CSS, tests and
engineering configuration are outside the data-authoring inventory.

## Executable enforcement

`configuration.audit.sh` enforces the compact JSON, three explicit typed/frozen
data owners and derived declarations elsewhere. `architecture.audit.sh` checks
silent talk defaults and pt-BR in their new owner. Transformer tests check compact
and full input, isolation, deep freezing and safe rejection. Adapter, animation
and SSR suites protect the existing public behavior.
