import { ORBU_TAG_NAME } from '@element/element.data'
import { describe, expect, it } from 'vitest'
import { defineOrbu } from './registration.service'

describe('service/registration', () => {
  it('registers the custom element idempotently', () => {
    const first = defineOrbu()
    const second = defineOrbu()

    expect(first).toBe(second)
    expect(customElements.get(ORBU_TAG_NAME)).toBe(first)
  })
})
