import { deepFreezeOrbVConfiguration } from '@core/lib/deep-freeze.compute'

import { orbvConfiguration } from './configuration.data'

export { orbvConfiguration } from './configuration.data'

export const ORBV_STATES = orbvConfiguration.component.states
export const ORBV_REDUCED_MOTION_MODES = orbvConfiguration.component.reducedMotionModes
export const ORBV_PRESET_NAMES = orbvConfiguration.appearance.presetNames
export const ORBV_PRESETS = orbvConfiguration.appearance.presets
export const DEFAULT_ORBV_PRESET = orbvConfiguration.appearance.defaultPreset
export const DEFAULT_ORBV_COLORS = ORBV_PRESETS[DEFAULT_ORBV_PRESET]
export const DEFAULT_ORBV_SIZE = orbvConfiguration.component.defaultSize
export const DEFAULT_ORBV_SPEED = orbvConfiguration.component.defaultSpeed
export const DEFAULT_ORBV_STATE = orbvConfiguration.component.defaultState
export const DEFAULT_ORBV_REDUCED_MOTION = orbvConfiguration.component.defaultReducedMotion
export const ORBV_COLOR_ATTRIBUTES = orbvConfiguration.appearance.colorAttributes
export const ORBV_COLOR_KEYS = orbvConfiguration.appearance.colorKeys

export const ORBV_VOICE_DEFAULTS = deepFreezeOrbVConfiguration({
  webSpeech: orbvConfiguration.speech.webSpeech,
  openaiSpeech: orbvConfiguration.speech.openaiSpeech,
  openaiRealtime: orbvConfiguration.realtime.openai
})

/** Compatibility bindings derived from compact JSON and internal data defaults. */
export const config = deepFreezeOrbVConfiguration({
  DEFAULT_ORBV_COLORS,
  DEFAULT_ORBV_PRESET,
  DEFAULT_ORBV_REDUCED_MOTION,
  DEFAULT_ORBV_SIZE,
  DEFAULT_ORBV_SPEED,
  DEFAULT_ORBV_STATE,
  ORBV_COLOR_ATTRIBUTES,
  ORBV_COLOR_KEYS,
  ORBV_PRESET_NAMES,
  ORBV_PRESETS,
  ORBV_REDUCED_MOTION_MODES,
  ORBV_STATES
})
