import { ORB_VOICE_TAG_NAME } from '@element/element.data'
import { describe, expect, it } from 'vitest'
import { defineOrbVoice } from './registration.service'

describe('service/registration', () => {
  it('registers the custom element idempotently', () => {
    const first = defineOrbVoice()
    const second = defineOrbVoice()

    expect(first).toBe(second)
    expect(customElements.get(ORB_VOICE_TAG_NAME)).toBe(first)
  })
})
