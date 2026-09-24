import { DEFAULT_ORBO_STATE } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrboState } from './normalize-state.compute'

describe('core/normalize-state', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrboState('unknown')).toBe(DEFAULT_ORBO_STATE)
  })
})
