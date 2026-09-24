import { DEFAULT_ORBU_REDUCED_MOTION } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbuReducedMotion } from './normalize-reduced-motion.compute'

describe('core/normalize-reduced-motion', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbuReducedMotion('unknown')).toBe(DEFAULT_ORBU_REDUCED_MOTION)
  })
})
