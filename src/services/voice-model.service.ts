import { orbvConfiguration } from '@core/config.data'
import type { OrbVConversationPort } from '@ports/conversation.port'
import type { OrbVVoiceEnginePort } from '@ports/voice-engine.port'
import { OpenAIRealtimeAdapter } from '@talk/openai-realtime.adapter'
import { OpenAISpeechAdapter } from '@talk/openai-speech.adapter'
import type { OrbVRealtimeSession, OrbVVoiceModel } from '@talk/voice-model.types'
import { WebSpeechAdapter } from '@talk/web-speech.adapter'

/** Resolve only at element construction; explicitly clearing a selection stays cleared. */
export function createDefaultOrbVVoiceModel(): Readonly<OrbVVoiceModel> | undefined {
  const provider = orbvConfiguration.speech.defaultVoiceModel
  if (provider === 'web-speech' || provider === 'openai-realtime') {
    return Object.freeze({ provider })
  }
  // OpenAI speech requires the application's endpoint. A JSON selector cannot
  // supply it, so remain unset until the consumer assigns a complete voiceModel.
  return undefined
}

/** Resolution creates inert adapters; activation belongs to explicit start methods. */
export function createOrbVVoiceEngine(
  model: Readonly<OrbVVoiceModel> | undefined
): OrbVVoiceEnginePort | undefined {
  switch (model?.provider) {
    case 'web-speech':
      return new WebSpeechAdapter(model)
    case 'openai-speech':
      return new OpenAISpeechAdapter(model)
    default:
      return undefined
  }
}

export function createOrbVConversation(
  model: Readonly<OrbVVoiceModel> | undefined,
  session: OrbVRealtimeSession | undefined
): OrbVConversationPort {
  if (model?.provider !== 'openai-realtime') {
    throw new Error('OrbV startConversation() requires a Realtime voiceModel.')
  }
  if (!session) {
    throw new Error('OrbV realtimeSession must be configured before startConversation().')
  }
  return new OpenAIRealtimeAdapter({ ...model, session })
}
