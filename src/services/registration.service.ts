import { orbVoiceElementClassFactory } from '@factories/element-class.factory'
import type { OrbVoiceElementConstructor } from '@element/element.types'
import { ORB_VOICE_TAG_NAME } from '@element/element.data'

/** Defines `<orb-voice>` once in the active Custom Element registry. */
export function defineOrbVoice(): OrbVoiceElementConstructor | undefined {
  if (typeof globalThis.customElements === 'undefined') {
    return undefined
  }

  const existing = globalThis.customElements.get(ORB_VOICE_TAG_NAME)
  if (existing) {
    return existing as OrbVoiceElementConstructor
  }

  const elementConstructor = orbVoiceElementClassFactory()
  if (!elementConstructor) {
    return undefined
  }

  globalThis.customElements.define(ORB_VOICE_TAG_NAME, elementConstructor)

  return elementConstructor
}
