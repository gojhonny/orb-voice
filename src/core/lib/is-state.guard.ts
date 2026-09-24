import type { OrbVoiceState } from '@core/appearance/appearance.types'
import { ORB_VOICE_STATES } from '@core/config.data'

export function isOrbVoiceState(value: unknown): value is OrbVoiceState {
  return typeof value === 'string' && (ORB_VOICE_STATES as readonly string[]).includes(value)
}
