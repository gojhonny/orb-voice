import { DEFAULT_ORBV_SPEED } from '@core/config.data'

export function normalizeOrbVSpeed(value: unknown): number {
  const numericValue = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : DEFAULT_ORBV_SPEED
}
