import { describe, expect, it } from 'vitest'

import { ORB_VOICE_OBSERVED_ATTRIBUTES, ORB_VOICE_TAG_NAME } from './element.data'

describe('element/public-data', () => {
  it('defines the native tag and observes speech plus appearance attributes', () => {
    expect(ORB_VOICE_TAG_NAME).toBe('orb-voice')
    expect(ORB_VOICE_OBSERVED_ATTRIBUTES).toContain('speech')
    expect(ORB_VOICE_OBSERVED_ATTRIBUTES).toContain('state')
    expect(ORB_VOICE_OBSERVED_ATTRIBUTES).toContain('color-primary')
  })
})
