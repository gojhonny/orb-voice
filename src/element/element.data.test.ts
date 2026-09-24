import { describe, expect, it } from 'vitest'

import { ORBO_OBSERVED_ATTRIBUTES, ORBO_TAG_NAME } from './element.data'

describe('element/public-data', () => {
  it('defines the native tag and observes speech plus appearance attributes', () => {
    expect(ORBO_TAG_NAME).toBe('orb-o')
    expect(ORBO_OBSERVED_ATTRIBUTES).toContain('speech')
    expect(ORBO_OBSERVED_ATTRIBUTES).toContain('state')
    expect(ORBO_OBSERVED_ATTRIBUTES).toContain('color-primary')
  })
})
