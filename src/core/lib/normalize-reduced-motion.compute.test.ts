import { DEFAULT_ORBO_REDUCED_MOTION } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrboReducedMotion } from './normalize-reduced-motion.compute'

describe('core/normalize-reduced-motion', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrboReducedMotion('unknown')).toBe(DEFAULT_ORBO_REDUCED_MOTION)
  })
})
