import type { OrboState } from '@core/appearance/appearance.types'
import { ORBO_STATES } from '@core/config.data'

export function isOrboState(value: unknown): value is OrboState {
  return typeof value === 'string' && (ORBO_STATES as readonly string[]).includes(value)
}
