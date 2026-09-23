import { DEFAULT_ORB_VOICE_SPEED } from '@core/config.data'

export function normalizeOrbVoiceSpeed(value: unknown): number {
  const numericValue = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : DEFAULT_ORB_VOICE_SPEED
}
