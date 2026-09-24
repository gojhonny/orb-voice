import { orboConfiguration } from '@core/config.data'
import type { OrboConversationPort } from '@ports/conversation.port'
import type { OrboVoiceEnginePort } from '@ports/voice-engine.port'
import { OpenAIRealtimeAdapter } from '@talk/openai-realtime.adapter'
import { OpenAISpeechAdapter } from '@talk/openai-speech.adapter'
import type { OrboRealtimeSession, OrboVoiceModel } from '@talk/voice-model.types'
import { WebSpeechAdapter } from '@talk/web-speech.adapter'

/** Resolve only at element construction; explicitly clearing a selection stays cleared. */
export function createDefaultOrboVoiceModel(): Readonly<OrboVoiceModel> | undefined {
  const provider = orboConfiguration.speech.defaultVoiceModel
  if (provider === 'web-speech' || provider === 'openai-realtime') {
    return Object.freeze({ provider })
  }
  // OpenAI speech requires the application's endpoint. A JSON selector cannot
  // supply it, so remain unset until the consumer assigns a complete voiceModel.
  return undefined
}

/** Resolution creates inert adapters; activation belongs to explicit start methods. */
export function createOrboVoiceEngine(
  model: Readonly<OrboVoiceModel> | undefined
): OrboVoiceEnginePort | undefined {
  switch (model?.provider) {
    case 'web-speech':
      return new WebSpeechAdapter(model)
    case 'openai-speech':
      return new OpenAISpeechAdapter(model)
    default:
      return undefined
  }
}

export function createOrboConversation(
  model: Readonly<OrboVoiceModel> | undefined,
  session: OrboRealtimeSession | undefined
): OrboConversationPort {
  if (model?.provider !== 'openai-realtime') {
    throw new Error('Orbo startConversation() requires a Realtime voiceModel.')
  }
  if (!session) {
    throw new Error('Orbo realtimeSession must be configured before startConversation().')
  }
  return new OpenAIRealtimeAdapter({ ...model, session })
}
