import type { OrbVReducedMotion } from '@core/appearance/appearance.types'
import { DEFAULT_ORBV_REDUCED_MOTION } from '@core/config.data'
import { isOrbVReducedMotion } from '@core/motion/is-reduced-motion.guard'

export function normalizeOrbVReducedMotion(value: unknown): OrbVReducedMotion {
  return isOrbVReducedMotion(value) ? value : DEFAULT_ORBV_REDUCED_MOTION
}
