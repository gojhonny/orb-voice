import { DEFAULT_ORBV_REDUCED_MOTION } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbVReducedMotion } from './normalize-reduced-motion.compute'

describe('core/normalize-reduced-motion', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbVReducedMotion('unknown')).toBe(DEFAULT_ORBV_REDUCED_MOTION)
  })
})
