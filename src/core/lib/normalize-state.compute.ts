import type { OrbVoiceState } from '@core/appearance/appearance.types'
import { DEFAULT_ORB_VOICE_STATE } from '@core/config.data'

import { isOrbVoiceState } from './is-state.guard'

export function normalizeOrbVoiceState(value: unknown): OrbVoiceState {
  return isOrbVoiceState(value) ? value : DEFAULT_ORB_VOICE_STATE
}
