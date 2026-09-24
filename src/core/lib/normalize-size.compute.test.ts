import { DEFAULT_ORBU_SIZE } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbuSize } from './normalize-size.compute'

describe('core/normalize-size', () => {
  it('trims valid CSS sizes and restores the default for blank input', () => {
    expect(normalizeOrbuSize(' 24px ')).toBe('24px')
    expect(normalizeOrbuSize('   ')).toBe(DEFAULT_ORBU_SIZE)
  })
})
