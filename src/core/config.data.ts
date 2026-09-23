import { deepFreezeOrbVoiceConfiguration } from '@core/lib/deep-freeze.compute'

import { orbVoiceConfiguration } from './configuration.data'

export { orbVoiceConfiguration } from './configuration.data'

export const ORB_VOICE_STATES = orbVoiceConfiguration.component.states
export const ORB_VOICE_REDUCED_MOTION_MODES = orbVoiceConfiguration.component.reducedMotionModes
export const ORB_VOICE_PRESET_NAMES = orbVoiceConfiguration.appearance.presetNames
export const ORB_VOICE_PRESETS = orbVoiceConfiguration.appearance.presets
export const DEFAULT_ORB_VOICE_PRESET = orbVoiceConfiguration.appearance.defaultPreset
export const DEFAULT_ORB_VOICE_COLORS = ORB_VOICE_PRESETS[DEFAULT_ORB_VOICE_PRESET]
export const DEFAULT_ORB_VOICE_SIZE = orbVoiceConfiguration.component.defaultSize
export const DEFAULT_ORB_VOICE_SPEED = orbVoiceConfiguration.component.defaultSpeed
export const DEFAULT_ORB_VOICE_STATE = orbVoiceConfiguration.component.defaultState
export const DEFAULT_ORB_VOICE_REDUCED_MOTION = orbVoiceConfiguration.component.defaultReducedMotion
export const ORB_VOICE_COLOR_ATTRIBUTES = orbVoiceConfiguration.appearance.colorAttributes
export const ORB_VOICE_COLOR_KEYS = orbVoiceConfiguration.appearance.colorKeys

export const ORB_VOICE_VOICE_DEFAULTS = deepFreezeOrbVoiceConfiguration({
  webSpeech: orbVoiceConfiguration.speech.webSpeech,
  openaiSpeech: orbVoiceConfiguration.speech.openaiSpeech,
  openaiRealtime: orbVoiceConfiguration.realtime.openai
})

/** Compatibility bindings derived from compact JSON and internal data defaults. */
export const config = deepFreezeOrbVoiceConfiguration({
  DEFAULT_ORB_VOICE_COLORS,
  DEFAULT_ORB_VOICE_PRESET,
  DEFAULT_ORB_VOICE_REDUCED_MOTION,
  DEFAULT_ORB_VOICE_SIZE,
  DEFAULT_ORB_VOICE_SPEED,
  DEFAULT_ORB_VOICE_STATE,
  ORB_VOICE_COLOR_ATTRIBUTES,
  ORB_VOICE_COLOR_KEYS,
  ORB_VOICE_PRESET_NAMES,
  ORB_VOICE_PRESETS,
  ORB_VOICE_REDUCED_MOTION_MODES,
  ORB_VOICE_STATES
})
