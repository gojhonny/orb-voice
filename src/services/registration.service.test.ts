import { ORBO_TAG_NAME } from '@element/element.data'
import { describe, expect, it } from 'vitest'
import { defineOrbo } from './registration.service'

describe('service/registration', () => {
  it('registers the custom element idempotently', () => {
    const first = defineOrbo()
    const second = defineOrbo()

    expect(first).toBe(second)
    expect(customElements.get(ORBO_TAG_NAME)).toBe(first)
  })
})
