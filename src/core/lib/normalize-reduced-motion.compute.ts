import type { OrbuReducedMotion } from '@core/appearance/appearance.types'
import { DEFAULT_ORBU_REDUCED_MOTION } from '@core/config.data'
import { isOrbuReducedMotion } from '@core/motion/is-reduced-motion.guard'

export function normalizeOrbuReducedMotion(value: unknown): OrbuReducedMotion {
  return isOrbuReducedMotion(value) ? value : DEFAULT_ORBU_REDUCED_MOTION
}
