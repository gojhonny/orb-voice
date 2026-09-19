import type { ORBV_PRESET_NAMES, ORBV_REDUCED_MOTION_MODES, ORBV_STATES } from '@core/config.data'

export type OrbVState = (typeof ORBV_STATES)[number]
export type OrbVReducedMotion = (typeof ORBV_REDUCED_MOTION_MODES)[number]
/** @deprecated Use neongate; the accidentally published name remains accepted. */
type LegacyPresetName = 'gojhonny'
export type OrbVPresetName = (typeof ORBV_PRESET_NAMES)[number] | LegacyPresetName
export type OrbVSize = number | string

export interface OrbVColors {
  accent: string
  background: string
  highlight: string
  primary: string
  secondary: string
}

export type OrbVColorOverrides = Partial<OrbVColors>

export interface OrbVPresetOptions {
  colorAccent?: never
  colorBackground?: never
  colorHighlight?: never
  colorPrimary?: never
  colorSecondary?: never
  preset?: OrbVPresetName
}

export interface OrbVCustomColorOptions {
  colorAccent?: string
  colorBackground?: string
  colorHighlight?: string
  colorPrimary?: string
  colorSecondary?: string
  preset?: never
}

export type OrbVColorSelection = OrbVPresetOptions | OrbVCustomColorOptions

export interface OrbVBaseOptions {
  elevated?: boolean
  paused?: boolean
  reducedMotion?: OrbVReducedMotion
  size?: OrbVSize
  speech?: string
  speed?: number
  state?: OrbVState
}

export type OrbVOptions = OrbVBaseOptions & OrbVColorSelection
