import { orbvElementClassFactory } from '@factories/element-class.factory'
import type { OrbVElementConstructor } from '@element/element.types'
import { ORBV_TAG_NAME } from '@element/element.data'

/** Defines `<orb-v>` once in the active Custom Element registry. */
export function defineOrbV(): OrbVElementConstructor | undefined {
  if (typeof globalThis.customElements === 'undefined') {
    return undefined
  }

  const existing = globalThis.customElements.get(ORBV_TAG_NAME)
  if (existing) {
    return existing as OrbVElementConstructor
  }

  const elementConstructor = orbvElementClassFactory()
  if (!elementConstructor) {
    return undefined
  }

  globalThis.customElements.define(ORBV_TAG_NAME, elementConstructor)

  return elementConstructor
}
