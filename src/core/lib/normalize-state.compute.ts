import type { OrbVState } from '@core/appearance/appearance.types'
import { DEFAULT_ORBV_STATE } from '@core/config.data'

import { isOrbVState } from './is-state.guard'

export function normalizeOrbVState(value: unknown): OrbVState {
  return isOrbVState(value) ? value : DEFAULT_ORBV_STATE
}
