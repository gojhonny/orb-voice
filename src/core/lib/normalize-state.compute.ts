import type { OrbuState } from '@core/appearance/appearance.types'
import { DEFAULT_ORBU_STATE } from '@core/config.data'

import { isOrbuState } from './is-state.guard'

export function normalizeOrbuState(value: unknown): OrbuState {
  return isOrbuState(value) ? value : DEFAULT_ORBU_STATE
}
