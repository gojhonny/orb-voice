import { orboElementClassFactory } from '@factories/element-class.factory'
import type { OrboElementConstructor } from '@element/element.types'
import { ORBO_TAG_NAME } from '@element/element.data'

/** Defines `<orb-o>` once in the active Custom Element registry. */
export function defineOrbo(): OrboElementConstructor | undefined {
  if (typeof globalThis.customElements === 'undefined') {
    return undefined
  }

  const existing = globalThis.customElements.get(ORBO_TAG_NAME)
  if (existing) {
    return existing as OrboElementConstructor
  }

  const elementConstructor = orboElementClassFactory()
  if (!elementConstructor) {
    return undefined
  }

  globalThis.customElements.define(ORBO_TAG_NAME, elementConstructor)

  return elementConstructor
}
