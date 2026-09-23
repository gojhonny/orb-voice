import { DEFAULT_ORBV_SPEED } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbVSpeed } from './normalize-speed.compute'

describe('core/normalize-speed', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbVSpeed(Number.POSITIVE_INFINITY)).toBe(DEFAULT_ORBV_SPEED)
  })
})
