import { ORBV_TAG_NAME } from '@element/element.data'
import { describe, expect, it } from 'vitest'
import { defineOrbV } from './registration.service'

describe('service/registration', () => {
  it('registers the custom element idempotently', () => {
    const first = defineOrbV()
    const second = defineOrbV()

    expect(first).toBe(second)
    expect(customElements.get(ORBV_TAG_NAME)).toBe(first)
  })
})
