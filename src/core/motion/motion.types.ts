export type OrbVoiceAnimationScalar = number | string

export type OrbVoiceAnimationSeries = OrbVoiceAnimationScalar | readonly OrbVoiceAnimationScalar[]

export interface OrbVoiceAnimationValues {
  '--orb-voice-angle'?: OrbVoiceAnimationSeries
  opacity?: OrbVoiceAnimationSeries
  rotate?: OrbVoiceAnimationSeries
  scale?: OrbVoiceAnimationSeries
  x?: OrbVoiceAnimationSeries
  y?: OrbVoiceAnimationSeries
}

export interface OrbVoiceTransition {
  /** Duration in seconds, matching the original Orb Voice motion profiles. */
  duration: number
  ease?: 'easeInOut' | 'easeOut' | 'linear'
  repeat?: number
  repeatType?: 'reverse'
  times?: readonly number[]
}

export interface OrbVoiceLayerMotion {
  animate: OrbVoiceAnimationValues
  transition: OrbVoiceTransition
}

export interface OrbVoiceMotionProfile {
  aura: OrbVoiceLayerMotion
  contrast: number
  core: OrbVoiceLayerMotion
  field: OrbVoiceLayerMotion
  highlight: OrbVoiceLayerMotion
  ring: OrbVoiceLayerMotion
  root: OrbVoiceLayerMotion
  saturation: number
}
