import { DEFAULT_ORBV_SIZE } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { normalizeOrbVSize } from './normalize-size.compute'

describe('core/normalize-size', () => {
  it('trims valid CSS sizes and restores the default for blank input', () => {
    expect(normalizeOrbVSize(' 24px ')).toBe('24px')
    expect(normalizeOrbVSize('   ')).toBe(DEFAULT_ORBV_SIZE)
  })
})
