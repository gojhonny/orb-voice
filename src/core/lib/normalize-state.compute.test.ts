import { DEFAULT_ORBV_STATE } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbVState } from './normalize-state.compute'

describe('core/normalize-state', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbVState('unknown')).toBe(DEFAULT_ORBV_STATE)
  })
})
