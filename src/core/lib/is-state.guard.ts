import type { OrbVState } from '@core/appearance/appearance.types'
import { ORBV_STATES } from '@core/config.data'

export function isOrbVState(value: unknown): value is OrbVState {
  return typeof value === 'string' && (ORBV_STATES as readonly string[]).includes(value)
}
