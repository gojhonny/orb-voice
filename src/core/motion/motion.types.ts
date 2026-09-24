export type OrbuAnimationScalar = number | string

export type OrbuAnimationSeries = OrbuAnimationScalar | readonly OrbuAnimationScalar[]

export interface OrbuAnimationValues {
  '--orbu-angle'?: OrbuAnimationSeries
  opacity?: OrbuAnimationSeries
  rotate?: OrbuAnimationSeries
  scale?: OrbuAnimationSeries
  x?: OrbuAnimationSeries
  y?: OrbuAnimationSeries
}

export interface OrbuTransition {
  /** Duration in seconds, matching the original Orbu motion profiles. */
  duration: number
  ease?: 'easeInOut' | 'easeOut' | 'linear'
  repeat?: number
  repeatType?: 'reverse'
  times?: readonly number[]
}

export interface OrbuLayerMotion {
  animate: OrbuAnimationValues
  transition: OrbuTransition
}

export interface OrbuMotionProfile {
  aura: OrbuLayerMotion
  contrast: number
  core: OrbuLayerMotion
  field: OrbuLayerMotion
  highlight: OrbuLayerMotion
  ring: OrbuLayerMotion
  root: OrbuLayerMotion
  saturation: number
}
