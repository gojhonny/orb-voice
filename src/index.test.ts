/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'

describe('core/ssr-entry', () => {
  it('imports without evaluating an HTMLElement subclass', async () => {
    const orbu = await import('./index')

    expect(globalThis.HTMLElement).toBeUndefined()
    expect(orbu.orbuElementClassFactory()).toBeUndefined()
    expect(orbu.defineOrbu()).toBeUndefined()
    expect(orbu.ORBU_TAG_NAME).toBe('orb-u')
    expect(orbu.orbuConfiguration.component.tagName).toBe('orb-u')
  })
})
