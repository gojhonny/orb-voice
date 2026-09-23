import { orbvConfiguration } from '@core/config.data'

import type { OrbVTalkStep } from './talk.types'

export const DEFAULT_SPEECH_LANGUAGE = orbvConfiguration.speech.webSpeech.language

/**
 * OrbV ships without product copy. Consumers may provide an explicit talk flow,
 * but the package never invents a greeting, persona, or fallback conversation.
 */
export const talk: Readonly<Record<string, OrbVTalkStep>> = orbvConfiguration.speech.talk

export const DEFAULT_TALK_FLOW: readonly OrbVTalkStep[] = orbvConfiguration.speech.defaultTalkFlow
