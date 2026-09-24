import type { OrboState } from '@core/appearance/appearance.types'
import { DEFAULT_ORBO_STATE } from '@core/config.data'

import { isOrboState } from './is-state.guard'

export function normalizeOrboState(value: unknown): OrboState {
  return isOrboState(value) ? value : DEFAULT_ORBO_STATE
}
