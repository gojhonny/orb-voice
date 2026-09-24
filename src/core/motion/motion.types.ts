export type OrboAnimationScalar = number | string

export type OrboAnimationSeries = OrboAnimationScalar | readonly OrboAnimationScalar[]

export interface OrboAnimationValues {
  '--orbo-angle'?: OrboAnimationSeries
  opacity?: OrboAnimationSeries
  rotate?: OrboAnimationSeries
  scale?: OrboAnimationSeries
  x?: OrboAnimationSeries
  y?: OrboAnimationSeries
}

export interface OrboTransition {
  /** Duration in seconds, matching the original Orbo motion profiles. */
  duration: number
  ease?: 'easeInOut' | 'easeOut' | 'linear'
  repeat?: number
  repeatType?: 'reverse'
  times?: readonly number[]
}

export interface OrboLayerMotion {
  animate: OrboAnimationValues
  transition: OrboTransition
}

export interface OrboMotionProfile {
  aura: OrboLayerMotion
  contrast: number
  core: OrboLayerMotion
  field: OrboLayerMotion
  highlight: OrboLayerMotion
  ring: OrboLayerMotion
  root: OrboLayerMotion
  saturation: number
}
