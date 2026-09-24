import { DEFAULT_ORB_VOICE_SPEED } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbVoiceSpeed } from './normalize-speed.compute'

describe('core/normalize-speed', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbVoiceSpeed(Number.POSITIVE_INFINITY)).toBe(DEFAULT_ORB_VOICE_SPEED)
  })
})
