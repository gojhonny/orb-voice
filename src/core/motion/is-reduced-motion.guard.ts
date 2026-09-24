import type { OrboReducedMotion } from '@core/appearance/appearance.types'
import { ORBO_REDUCED_MOTION_MODES } from '@core/config.data'

export function isOrboReducedMotion(value: unknown): value is OrboReducedMotion {
  return (
    typeof value === 'string' && (ORBO_REDUCED_MOTION_MODES as readonly string[]).includes(value)
  )
}
