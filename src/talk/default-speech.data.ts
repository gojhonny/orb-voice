import type { OrbVSpeechConfiguration } from '@core/config.types'
import { deepFreezeOrbVConfiguration } from '@core/lib/deep-freeze.compute'

/** Internal defaults restored from the pre-SPEC-025 configuration. */
export const ORBV_DEFAULT_SPEECH = deepFreezeOrbVConfiguration({
  defaultVoiceModel: null,
  models: ['web-speech', 'openai-speech', 'openai-realtime'],
  talk: {},
  defaultTalkFlow: [],
  tokenPattern: {
    source: '\\{\\{([a-zA-Z][a-zA-Z0-9]*)\\}\\}',
    flags: 'g'
  },
  webSpeech: {
    language: 'pt-BR',
    pitch: 1,
    rate: 1,
    volume: 1,
    preferredVoices: [
      'Google português do Brasil',
      'Microsoft Francisca Online',
      'Microsoft Antonio Online',
      'Português Brasil',
      'Luciana',
      'Felipe'
    ],
    voiceLoadTimeoutMs: 1500,
    speechStartTimeoutMs: 5000
  },
  openaiSpeech: {
    model: 'gpt-4o-mini-tts',
    responseFormat: 'mp3',
    voice: 'marin',
    legacyVoice: 'alloy',
    instructions:
      'Fale em português do Brasil com dicção natural, ritmo calmo e entonação conversacional. Não traduza nomes próprios nem invente conteúdo além do texto recebido.',
    credentials: 'same-origin',
    requestTimeoutMs: 30000
  }
} satisfies OrbVSpeechConfiguration)
