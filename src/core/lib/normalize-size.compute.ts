import type { OrboSize } from '@core/appearance/appearance.types'
import { DEFAULT_ORBO_SIZE } from '@core/config.data'

export function normalizeOrboSize(value: OrboSize | null | undefined): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? `${value}px` : DEFAULT_ORBO_SIZE
  }

  if (typeof value !== 'string') {
    return DEFAULT_ORBO_SIZE
  }

  const trimmedValue = value.trim()
  if (trimmedValue.length === 0) {
    return DEFAULT_ORBO_SIZE
  }

  const numericValue = Number(trimmedValue)
  if (Number.isFinite(numericValue)) {
    return numericValue > 0 ? `${numericValue}px` : DEFAULT_ORBO_SIZE
  }

  return trimmedValue
}
