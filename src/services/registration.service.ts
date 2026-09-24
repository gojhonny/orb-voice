import { orbuElementClassFactory } from '@factories/element-class.factory'
import type { OrbuElementConstructor } from '@element/element.types'
import { ORBU_TAG_NAME } from '@element/element.data'

/** Defines `<orb-u>` once in the active Custom Element registry. */
export function defineOrbu(): OrbuElementConstructor | undefined {
  if (typeof globalThis.customElements === 'undefined') {
    return undefined
  }

  const existing = globalThis.customElements.get(ORBU_TAG_NAME)
  if (existing) {
    return existing as OrbuElementConstructor
  }

  const elementConstructor = orbuElementClassFactory()
  if (!elementConstructor) {
    return undefined
  }

  globalThis.customElements.define(ORBU_TAG_NAME, elementConstructor)

  return elementConstructor
}
