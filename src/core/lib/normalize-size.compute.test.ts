import { DEFAULT_ORBO_SIZE } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrboSize } from './normalize-size.compute'

describe('core/normalize-size', () => {
  it('trims valid CSS sizes and restores the default for blank input', () => {
    expect(normalizeOrboSize(' 24px ')).toBe('24px')
    expect(normalizeOrboSize('   ')).toBe(DEFAULT_ORBO_SIZE)
  })
})
