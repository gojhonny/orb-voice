import type { OrbVoiceReducedMotion } from '@core/appearance/appearance.types'
import { ORB_VOICE_REDUCED_MOTION_MODES } from '@core/config.data'

export function isOrbVoiceReducedMotion(value: unknown): value is OrbVoiceReducedMotion {
  return (
    typeof value === 'string' && (ORB_VOICE_REDUCED_MOTION_MODES as readonly string[]).includes(value)
  )
}
