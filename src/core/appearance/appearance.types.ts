import type { ORB_VOICE_PRESET_NAMES, ORB_VOICE_REDUCED_MOTION_MODES, ORB_VOICE_STATES } from '@core/config.data'

export type OrbVoiceState = (typeof ORB_VOICE_STATES)[number]
export type OrbVoiceReducedMotion = (typeof ORB_VOICE_REDUCED_MOTION_MODES)[number]
/** @deprecated Use neongate; the accidentally published name remains accepted. */
type LegacyPresetName = 'gojhonny'
export type OrbVoicePresetName = (typeof ORB_VOICE_PRESET_NAMES)[number] | LegacyPresetName
export type OrbVoiceSize = number | string

export interface OrbVoiceColors {
  accent: string
  background: string
  highlight: string
  primary: string
  secondary: string
}

export type OrbVoiceColorOverrides = Partial<OrbVoiceColors>

export interface OrbVoicePresetOptions {
  colorAccent?: never
  colorBackground?: never
  colorHighlight?: never
  colorPrimary?: never
  colorSecondary?: never
  preset?: OrbVoicePresetName
}

export interface OrbVoiceCustomColorOptions {
  colorAccent?: string
  colorBackground?: string
  colorHighlight?: string
  colorPrimary?: string
  colorSecondary?: string
  preset?: never
}

export type OrbVoiceColorSelection = OrbVoicePresetOptions | OrbVoiceCustomColorOptions

export interface OrbVoiceBaseOptions {
  elevated?: boolean
  paused?: boolean
  reducedMotion?: OrbVoiceReducedMotion
  size?: OrbVoiceSize
  speech?: string
  speed?: number
  state?: OrbVoiceState
}

export type OrbVoiceOptions = OrbVoiceBaseOptions & OrbVoiceColorSelection
