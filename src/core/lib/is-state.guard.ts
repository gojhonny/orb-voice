import type { OrbuState } from '@core/appearance/appearance.types'
import { ORBU_STATES } from '@core/config.data'

export function isOrbuState(value: unknown): value is OrbuState {
  return typeof value === 'string' && (ORBU_STATES as readonly string[]).includes(value)
}
