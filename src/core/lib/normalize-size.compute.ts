import type { OrbVoiceSize } from '@core/appearance/appearance.types'
import { DEFAULT_ORB_VOICE_SIZE } from '@core/config.data'

export function normalizeOrbVoiceSize(value: OrbVoiceSize | null | undefined): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? `${value}px` : DEFAULT_ORB_VOICE_SIZE
  }

  if (typeof value !== 'string') {
    return DEFAULT_ORB_VOICE_SIZE
  }

  const trimmedValue = value.trim()
  if (trimmedValue.length === 0) {
    return DEFAULT_ORB_VOICE_SIZE
  }

  const numericValue = Number(trimmedValue)
  if (Number.isFinite(numericValue)) {
    return numericValue > 0 ? `${numericValue}px` : DEFAULT_ORB_VOICE_SIZE
  }

  return trimmedValue
}
