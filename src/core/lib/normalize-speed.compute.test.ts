import { DEFAULT_ORBU_SPEED } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbuSpeed } from './normalize-speed.compute'

describe('core/normalize-speed', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbuSpeed(Number.POSITIVE_INFINITY)).toBe(DEFAULT_ORBU_SPEED)
  })
})
