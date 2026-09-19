import { describe, expect, it } from 'vitest'

import { orbvShadowTreeFactory } from './shadow-tree.factory'

describe('factory/shadow-tree', () => {
  it('marks the visual tree as hidden from assistive technology', () => {
    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })

    const tree = orbvShadowTreeFactory(shadowRoot, document)

    expect(tree.root.getAttribute('aria-hidden')).toBe('true')
  })
})
