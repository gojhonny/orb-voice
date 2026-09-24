import { orboConfiguration } from '@core/config.data'

import type { OrboTalkStep } from './talk.types'

export const DEFAULT_SPEECH_LANGUAGE = orboConfiguration.speech.webSpeech.language

/**
 * Orbo ships without product copy. Consumers may provide an explicit talk flow,
 * but the package never invents a greeting, persona, or fallback conversation.
 */
export const talk: Readonly<Record<string, OrboTalkStep>> = orboConfiguration.speech.talk

export const DEFAULT_TALK_FLOW: readonly OrboTalkStep[] = orboConfiguration.speech.defaultTalkFlow
