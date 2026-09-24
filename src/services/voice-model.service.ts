import { orbVoiceConfiguration } from '@core/config.data'
import type { OrbVoiceConversationPort } from '@ports/conversation.port'
import type { OrbVoiceVoiceEnginePort } from '@ports/voice-engine.port'
import { OpenAIRealtimeAdapter } from '@talk/openai-realtime.adapter'
import { OpenAISpeechAdapter } from '@talk/openai-speech.adapter'
import type { OrbVoiceRealtimeSession, OrbVoiceVoiceModel } from '@talk/voice-model.types'
import { WebSpeechAdapter } from '@talk/web-speech.adapter'

/** Resolve only at element construction; explicitly clearing a selection stays cleared. */
export function createDefaultOrbVoiceVoiceModel(): Readonly<OrbVoiceVoiceModel> | undefined {
  const provider = orbVoiceConfiguration.speech.defaultVoiceModel
  if (provider === 'web-speech' || provider === 'openai-realtime') {
    return Object.freeze({ provider })
  }
  // OpenAI speech requires the application's endpoint. A JSON selector cannot
  // supply it, so remain unset until the consumer assigns a complete voiceModel.
  return undefined
}

/** Resolution creates inert adapters; activation belongs to explicit start methods. */
export function createOrbVoiceVoiceEngine(
  model: Readonly<OrbVoiceVoiceModel> | undefined
): OrbVoiceVoiceEnginePort | undefined {
  switch (model?.provider) {
    case 'web-speech':
      return new WebSpeechAdapter(model)
    case 'openai-speech':
      return new OpenAISpeechAdapter(model)
    default:
      return undefined
  }
}

export function createOrbVoiceConversation(
  model: Readonly<OrbVoiceVoiceModel> | undefined,
  session: OrbVoiceRealtimeSession | undefined
): OrbVoiceConversationPort {
  if (model?.provider !== 'openai-realtime') {
    throw new Error('Orb Voice startConversation() requires a Realtime voiceModel.')
  }
  if (!session) {
    throw new Error('Orb Voice realtimeSession must be configured before startConversation().')
  }
  return new OpenAIRealtimeAdapter({ ...model, session })
}
