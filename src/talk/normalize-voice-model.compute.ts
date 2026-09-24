import type { OrboVoiceModel } from './voice-model.types'

/** Keep executable authorization and undeclared properties out of the public model. */
export function normalizeVoiceModel(
  value: OrboVoiceModel | null | undefined
): Readonly<OrboVoiceModel> | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  if (typeof value !== 'object') {
    throw new TypeError('Orbo voiceModel must be a provider configuration.')
  }

  let selection: OrboVoiceModel
  switch (value.provider) {
    case 'web-speech':
      selection = {
        provider: value.provider,
        ...(value.language === undefined ? {} : { language: value.language }),
        ...(value.pitch === undefined ? {} : { pitch: value.pitch }),
        ...(value.rate === undefined ? {} : { rate: value.rate }),
        ...(value.volume === undefined ? {} : { volume: value.volume }),
        ...(value.voiceLoadTimeoutMs === undefined
          ? {}
          : { voiceLoadTimeoutMs: value.voiceLoadTimeoutMs }),
        ...(value.preferredVoices === undefined
          ? {}
          : { preferredVoices: Object.freeze([...value.preferredVoices]) })
      }
      break
    case 'openai-speech':
      if (!String(value.endpoint ?? '').trim()) {
        throw new TypeError('Orbo OpenAI speech selection requires an application endpoint.')
      }
      selection = {
        provider: value.provider,
        endpoint: String(value.endpoint),
        ...(value.model === undefined ? {} : { model: value.model }),
        ...(value.voice === undefined ? {} : { voice: value.voice }),
        ...(value.responseFormat === undefined ? {} : { responseFormat: value.responseFormat }),
        ...(value.requestTimeoutMs === undefined
          ? {}
          : { requestTimeoutMs: value.requestTimeoutMs })
      }
      break
    case 'openai-realtime':
      selection = {
        provider: value.provider,
        ...(value.model === undefined ? {} : { model: value.model }),
        ...(value.voice === undefined ? {} : { voice: value.voice }),
        ...(value.sessionTimeoutMs === undefined
          ? {}
          : { sessionTimeoutMs: value.sessionTimeoutMs })
      }
      break
    default:
      throw new TypeError('Orbo voiceModel provider is not supported.')
  }

  for (const key of Object.keys(value)) {
    if (!(key in selection)) {
      // Explicit undefined optional options are harmless; extra properties are not copied.
      if (Reflect.get(value, key) !== undefined) {
        throw new TypeError('Orbo voiceModel contains an unsupported option.')
      }
    }
  }
  return Object.freeze(selection)
}
