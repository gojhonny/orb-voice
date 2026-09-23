import { describe, expect, it } from 'vitest'

import { ORBV_OBSERVED_ATTRIBUTES, ORBV_TAG_NAME } from './element.data'

describe('element/public-data', () => {
  it('defines the native tag and observes speech plus appearance attributes', () => {
    expect(ORBV_TAG_NAME).toBe('orb-v')
    expect(ORBV_OBSERVED_ATTRIBUTES).toContain('speech')
    expect(ORBV_OBSERVED_ATTRIBUTES).toContain('state')
    expect(ORBV_OBSERVED_ATTRIBUTES).toContain('color-primary')
  })
})
