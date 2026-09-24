import { DEFAULT_ORBO_SPEED } from '@core/config.data'

export function normalizeOrboSpeed(value: unknown): number {
  const numericValue = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : DEFAULT_ORBO_SPEED
}
