import { DEFAULT_ORBO_SPEED } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrboSpeed } from './normalize-speed.compute'

describe('core/normalize-speed', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrboSpeed(Number.POSITIVE_INFINITY)).toBe(DEFAULT_ORBO_SPEED)
  })
})
