import { DEFAULT_ORBU_SPEED } from '@core/config.data'

export function normalizeOrbuSpeed(value: unknown): number {
  const numericValue = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : DEFAULT_ORBU_SPEED
}
