export type OrbVAnimationScalar = number | string

export type OrbVAnimationSeries = OrbVAnimationScalar | readonly OrbVAnimationScalar[]

export interface OrbVAnimationValues {
  '--orbv-angle'?: OrbVAnimationSeries
  opacity?: OrbVAnimationSeries
  rotate?: OrbVAnimationSeries
  scale?: OrbVAnimationSeries
  x?: OrbVAnimationSeries
  y?: OrbVAnimationSeries
}

export interface OrbVTransition {
  /** Duration in seconds, matching the original OrbV motion profiles. */
  duration: number
  ease?: 'easeInOut' | 'easeOut' | 'linear'
  repeat?: number
  repeatType?: 'reverse'
  times?: readonly number[]
}

export interface OrbVLayerMotion {
  animate: OrbVAnimationValues
  transition: OrbVTransition
}

export interface OrbVMotionProfile {
  aura: OrbVLayerMotion
  contrast: number
  core: OrbVLayerMotion
  field: OrbVLayerMotion
  highlight: OrbVLayerMotion
  ring: OrbVLayerMotion
  root: OrbVLayerMotion
  saturation: number
}
