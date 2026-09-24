import { orbuConfiguration } from '@core/config.data'
import type { OrbuConversationPort } from '@ports/conversation.port'
import type { OrbuVoiceEnginePort } from '@ports/voice-engine.port'
import { OpenAIRealtimeAdapter } from '@talk/openai-realtime.adapter'
import { OpenAISpeechAdapter } from '@talk/openai-speech.adapter'
import type { OrbuRealtimeSession, OrbuVoiceModel } from '@talk/voice-model.types'
import { WebSpeechAdapter } from '@talk/web-speech.adapter'

/** Resolve only at element construction; explicitly clearing a selection stays cleared. */
export function createDefaultOrbuVoiceModel(): Readonly<OrbuVoiceModel> | undefined {
  const provider = orbuConfiguration.speech.defaultVoiceModel
  if (provider === 'web-speech' || provider === 'openai-realtime') {
    return Object.freeze({ provider })
  }
  // OpenAI speech requires the application's endpoint. A JSON selector cannot
  // supply it, so remain unset until the consumer assigns a complete voiceModel.
  return undefined
}

/** Resolution creates inert adapters; activation belongs to explicit start methods. */
export function createOrbuVoiceEngine(
  model: Readonly<OrbuVoiceModel> | undefined
): OrbuVoiceEnginePort | undefined {
  switch (model?.provider) {
    case 'web-speech':
      return new WebSpeechAdapter(model)
    case 'openai-speech':
      return new OpenAISpeechAdapter(model)
    default:
      return undefined
  }
}

export function createOrbuConversation(
  model: Readonly<OrbuVoiceModel> | undefined,
  session: OrbuRealtimeSession | undefined
): OrbuConversationPort {
  if (model?.provider !== 'openai-realtime') {
    throw new Error('Orbu startConversation() requires a Realtime voiceModel.')
  }
  if (!session) {
    throw new Error('Orbu realtimeSession must be configured before startConversation().')
  }
  return new OpenAIRealtimeAdapter({ ...model, session })
}
