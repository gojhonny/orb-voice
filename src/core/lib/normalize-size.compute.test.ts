import { DEFAULT_ORB_VOICE_SIZE } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbVoiceSize } from './normalize-size.compute'

describe('core/normalize-size', () => {
  it('trims valid CSS sizes and restores the default for blank input', () => {
    expect(normalizeOrbVoiceSize(' 24px ')).toBe('24px')
    expect(normalizeOrbVoiceSize('   ')).toBe(DEFAULT_ORB_VOICE_SIZE)
  })
})
