import type { OrbVSize } from '@core/appearance/appearance.types'
import { DEFAULT_ORBV_SIZE } from '@core/config.data'

export function normalizeOrbVSize(value: OrbVSize | null | undefined): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? `${value}px` : DEFAULT_ORBV_SIZE
  }

  if (typeof value !== 'string') {
    return DEFAULT_ORBV_SIZE
  }

  const trimmedValue = value.trim()
  if (trimmedValue.length === 0) {
    return DEFAULT_ORBV_SIZE
  }

  const numericValue = Number(trimmedValue)
  if (Number.isFinite(numericValue)) {
    return numericValue > 0 ? `${numericValue}px` : DEFAULT_ORBV_SIZE
  }

  return trimmedValue
}
