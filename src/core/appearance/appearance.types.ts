import type { ORBO_PRESET_NAMES, ORBO_REDUCED_MOTION_MODES, ORBO_STATES } from '@core/config.data'

export type OrboState = (typeof ORBO_STATES)[number]
export type OrboReducedMotion = (typeof ORBO_REDUCED_MOTION_MODES)[number]
/** @deprecated Use neongate; the accidentally published name remains accepted. */
type LegacyPresetName = 'gojhonny'
export type OrboPresetName = (typeof ORBO_PRESET_NAMES)[number] | LegacyPresetName
export type OrboSize = number | string

export interface OrboColors {
  accent: string
  background: string
  highlight: string
  primary: string
  secondary: string
}

export type OrboColorOverrides = Partial<OrboColors>

export interface OrboPresetOptions {
  colorAccent?: never
  colorBackground?: never
  colorHighlight?: never
  colorPrimary?: never
  colorSecondary?: never
  preset?: OrboPresetName
}

export interface OrboCustomColorOptions {
  colorAccent?: string
  colorBackground?: string
  colorHighlight?: string
  colorPrimary?: string
  colorSecondary?: string
  preset?: never
}

export type OrboColorSelection = OrboPresetOptions | OrboCustomColorOptions

export interface OrboBaseOptions {
  elevated?: boolean
  paused?: boolean
  reducedMotion?: OrboReducedMotion
  size?: OrboSize
  speech?: string
  speed?: number
  state?: OrboState
}

export type OrboOptions = OrboBaseOptions & OrboColorSelection
