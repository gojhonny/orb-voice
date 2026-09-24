/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'

describe('core/ssr-entry', () => {
  it('imports without evaluating an HTMLElement subclass', async () => {
    const orbo = await import('./index')

    expect(globalThis.HTMLElement).toBeUndefined()
    expect(orbo.orboElementClassFactory()).toBeUndefined()
    expect(orbo.defineOrbo()).toBeUndefined()
    expect(orbo.ORBO_TAG_NAME).toBe('orb-o')
    expect(orbo.orboConfiguration.component.tagName).toBe('orb-o')
  })
})
