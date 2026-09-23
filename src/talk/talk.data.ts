import { orbVoiceConfiguration } from '@core/config.data'

import type { OrbVoiceTalkStep } from './talk.types'

export const DEFAULT_SPEECH_LANGUAGE = orbVoiceConfiguration.speech.webSpeech.language

/**
 * Orb Voice ships without product copy. Consumers may provide an explicit talk flow,
 * but the package never invents a greeting, persona, or fallback conversation.
 */
export const talk: Readonly<Record<string, OrbVoiceTalkStep>> = orbVoiceConfiguration.speech.talk

export const DEFAULT_TALK_FLOW: readonly OrbVoiceTalkStep[] = orbVoiceConfiguration.speech.defaultTalkFlow
