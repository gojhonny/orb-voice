import { DEFAULT_ORBU_STATE } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbuState } from './normalize-state.compute'

describe('core/normalize-state', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbuState('unknown')).toBe(DEFAULT_ORBU_STATE)
  })
})
