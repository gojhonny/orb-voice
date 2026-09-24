import type { OrbuReducedMotion } from '@core/appearance/appearance.types'
import { ORBU_REDUCED_MOTION_MODES } from '@core/config.data'

export function isOrbuReducedMotion(value: unknown): value is OrbuReducedMotion {
  return (
    typeof value === 'string' && (ORBU_REDUCED_MOTION_MODES as readonly string[]).includes(value)
  )
}
