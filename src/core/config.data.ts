import { deepFreezeOrbuConfiguration } from '@core/lib/deep-freeze.compute'

import { orbuConfiguration } from './configuration.data'

export { orbuConfiguration } from './configuration.data'

export const ORBU_STATES = orbuConfiguration.component.states
export const ORBU_REDUCED_MOTION_MODES = orbuConfiguration.component.reducedMotionModes
export const ORBU_PRESET_NAMES = orbuConfiguration.appearance.presetNames
export const ORBU_PRESETS = orbuConfiguration.appearance.presets
export const DEFAULT_ORBU_PRESET = orbuConfiguration.appearance.defaultPreset
export const DEFAULT_ORBU_COLORS = ORBU_PRESETS[DEFAULT_ORBU_PRESET]
export const DEFAULT_ORBU_SIZE = orbuConfiguration.component.defaultSize
export const DEFAULT_ORBU_SPEED = orbuConfiguration.component.defaultSpeed
export const DEFAULT_ORBU_STATE = orbuConfiguration.component.defaultState
export const DEFAULT_ORBU_REDUCED_MOTION = orbuConfiguration.component.defaultReducedMotion
export const ORBU_COLOR_ATTRIBUTES = orbuConfiguration.appearance.colorAttributes
export const ORBU_COLOR_KEYS = orbuConfiguration.appearance.colorKeys

export const ORBU_VOICE_DEFAULTS = deepFreezeOrbuConfiguration({
  webSpeech: orbuConfiguration.speech.webSpeech,
  openaiSpeech: orbuConfiguration.speech.openaiSpeech,
  openaiRealtime: orbuConfiguration.realtime.openai
})

/** Compatibility bindings derived from compact JSON and internal data defaults. */
export const config = deepFreezeOrbuConfiguration({
  DEFAULT_ORBU_COLORS,
  DEFAULT_ORBU_PRESET,
  DEFAULT_ORBU_REDUCED_MOTION,
  DEFAULT_ORBU_SIZE,
  DEFAULT_ORBU_SPEED,
  DEFAULT_ORBU_STATE,
  ORBU_COLOR_ATTRIBUTES,
  ORBU_COLOR_KEYS,
  ORBU_PRESET_NAMES,
  ORBU_PRESETS,
  ORBU_REDUCED_MOTION_MODES,
  ORBU_STATES
})
