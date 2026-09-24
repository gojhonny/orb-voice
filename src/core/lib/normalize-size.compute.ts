import type { OrbuSize } from '@core/appearance/appearance.types'
import { DEFAULT_ORBU_SIZE } from '@core/config.data'

export function normalizeOrbuSize(value: OrbuSize | null | undefined): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? `${value}px` : DEFAULT_ORBU_SIZE
  }

  if (typeof value !== 'string') {
    return DEFAULT_ORBU_SIZE
  }

  const trimmedValue = value.trim()
  if (trimmedValue.length === 0) {
    return DEFAULT_ORBU_SIZE
  }

  const numericValue = Number(trimmedValue)
  if (Number.isFinite(numericValue)) {
    return numericValue > 0 ? `${numericValue}px` : DEFAULT_ORBU_SIZE
  }

  return trimmedValue
}
