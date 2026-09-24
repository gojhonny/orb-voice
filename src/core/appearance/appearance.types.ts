import type { ORBU_PRESET_NAMES, ORBU_REDUCED_MOTION_MODES, ORBU_STATES } from '@core/config.data'

export type OrbuState = (typeof ORBU_STATES)[number]
export type OrbuReducedMotion = (typeof ORBU_REDUCED_MOTION_MODES)[number]
/** @deprecated Use neongate; the accidentally published name remains accepted. */
type LegacyPresetName = 'gojhonny'
export type OrbuPresetName = (typeof ORBU_PRESET_NAMES)[number] | LegacyPresetName
export type OrbuSize = number | string

export interface OrbuColors {
  accent: string
  background: string
  highlight: string
  primary: string
  secondary: string
}

export type OrbuColorOverrides = Partial<OrbuColors>

export interface OrbuPresetOptions {
  colorAccent?: never
  colorBackground?: never
  colorHighlight?: never
  colorPrimary?: never
  colorSecondary?: never
  preset?: OrbuPresetName
}

export interface OrbuCustomColorOptions {
  colorAccent?: string
  colorBackground?: string
  colorHighlight?: string
  colorPrimary?: string
  colorSecondary?: string
  preset?: never
}

export type OrbuColorSelection = OrbuPresetOptions | OrbuCustomColorOptions

export interface OrbuBaseOptions {
  elevated?: boolean
  paused?: boolean
  reducedMotion?: OrbuReducedMotion
  size?: OrbuSize
  speech?: string
  speed?: number
  state?: OrbuState
}

export type OrbuOptions = OrbuBaseOptions & OrbuColorSelection
