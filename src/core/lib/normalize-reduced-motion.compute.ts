import type { OrboReducedMotion } from '@core/appearance/appearance.types'
import { DEFAULT_ORBO_REDUCED_MOTION } from '@core/config.data'
import { isOrboReducedMotion } from '@core/motion/is-reduced-motion.guard'

export function normalizeOrboReducedMotion(value: unknown): OrboReducedMotion {
  return isOrboReducedMotion(value) ? value : DEFAULT_ORBO_REDUCED_MOTION
}
