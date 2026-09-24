import { describe, expect, it } from 'vitest'

import { ORBU_OBSERVED_ATTRIBUTES, ORBU_TAG_NAME } from './element.data'

describe('element/public-data', () => {
  it('defines the native tag and observes speech plus appearance attributes', () => {
    expect(ORBU_TAG_NAME).toBe('orb-u')
    expect(ORBU_OBSERVED_ATTRIBUTES).toContain('speech')
    expect(ORBU_OBSERVED_ATTRIBUTES).toContain('state')
    expect(ORBU_OBSERVED_ATTRIBUTES).toContain('color-primary')
  })
})
