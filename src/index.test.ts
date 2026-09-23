/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'

describe('core/ssr-entry', () => {
  it('imports without evaluating an HTMLElement subclass', async () => {
    const orbv = await import('./index')

    expect(globalThis.HTMLElement).toBeUndefined()
    expect(orbv.orbvElementClassFactory()).toBeUndefined()
    expect(orbv.defineOrbV()).toBeUndefined()
    expect(orbv.ORBV_TAG_NAME).toBe('orb-v')
    expect(orbv.orbvConfiguration.component.tagName).toBe('orb-v')
  })
})
