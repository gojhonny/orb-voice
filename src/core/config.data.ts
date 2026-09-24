import { deepFreezeOrboConfiguration } from '@core/lib/deep-freeze.compute'

import { orboConfiguration } from './configuration.data'

export { orboConfiguration } from './configuration.data'

export const ORBO_STATES = orboConfiguration.component.states
export const ORBO_REDUCED_MOTION_MODES = orboConfiguration.component.reducedMotionModes
export const ORBO_PRESET_NAMES = orboConfiguration.appearance.presetNames
export const ORBO_PRESETS = orboConfiguration.appearance.presets
export const DEFAULT_ORBO_PRESET = orboConfiguration.appearance.defaultPreset
export const DEFAULT_ORBO_COLORS = ORBO_PRESETS[DEFAULT_ORBO_PRESET]
export const DEFAULT_ORBO_SIZE = orboConfiguration.component.defaultSize
export const DEFAULT_ORBO_SPEED = orboConfiguration.component.defaultSpeed
export const DEFAULT_ORBO_STATE = orboConfiguration.component.defaultState
export const DEFAULT_ORBO_REDUCED_MOTION = orboConfiguration.component.defaultReducedMotion
export const ORBO_COLOR_ATTRIBUTES = orboConfiguration.appearance.colorAttributes
export const ORBO_COLOR_KEYS = orboConfiguration.appearance.colorKeys

export const ORBO_VOICE_DEFAULTS = deepFreezeOrboConfiguration({
  webSpeech: orboConfiguration.speech.webSpeech,
  openaiSpeech: orboConfiguration.speech.openaiSpeech,
  openaiRealtime: orboConfiguration.realtime.openai
})

/** Compatibility bindings derived from compact JSON and internal data defaults. */
export const config = deepFreezeOrboConfiguration({
  DEFAULT_ORBO_COLORS,
  DEFAULT_ORBO_PRESET,
  DEFAULT_ORBO_REDUCED_MOTION,
  DEFAULT_ORBO_SIZE,
  DEFAULT_ORBO_SPEED,
  DEFAULT_ORBO_STATE,
  ORBO_COLOR_ATTRIBUTES,
  ORBO_COLOR_KEYS,
  ORBO_PRESET_NAMES,
  ORBO_PRESETS,
  ORBO_REDUCED_MOTION_MODES,
  ORBO_STATES
})
