import type { OrbVReducedMotion } from '@core/appearance/appearance.types'
import { ORBV_REDUCED_MOTION_MODES } from '@core/config.data'

export function isOrbVReducedMotion(value: unknown): value is OrbVReducedMotion {
  return (
    typeof value === 'string' && (ORBV_REDUCED_MOTION_MODES as readonly string[]).includes(value)
  )
}
