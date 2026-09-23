import { DEFAULT_ORB_VOICE_REDUCED_MOTION } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbVoiceReducedMotion } from './normalize-reduced-motion.compute'

describe('core/normalize-reduced-motion', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbVoiceReducedMotion('unknown')).toBe(DEFAULT_ORB_VOICE_REDUCED_MOTION)
  })
})
