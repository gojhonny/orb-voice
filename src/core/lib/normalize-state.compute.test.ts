import { DEFAULT_ORB_VOICE_STATE } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbVoiceState } from './normalize-state.compute'

describe('core/normalize-state', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbVoiceState('unknown')).toBe(DEFAULT_ORB_VOICE_STATE)
  })
})
