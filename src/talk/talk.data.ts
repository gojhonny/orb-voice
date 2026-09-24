import { orbuConfiguration } from '@core/config.data'

import type { OrbuTalkStep } from './talk.types'

export const DEFAULT_SPEECH_LANGUAGE = orbuConfiguration.speech.webSpeech.language

/**
 * Orbu ships without product copy. Consumers may provide an explicit talk flow,
 * but the package never invents a greeting, persona, or fallback conversation.
 */
export const talk: Readonly<Record<string, OrbuTalkStep>> = orbuConfiguration.speech.talk

export const DEFAULT_TALK_FLOW: readonly OrbuTalkStep[] = orbuConfiguration.speech.defaultTalkFlow
