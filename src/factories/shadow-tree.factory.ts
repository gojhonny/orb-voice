import styles from 'virtual:orb-voice-styles'

import {
  DEFAULT_ORB_VOICE_COLORS,
  DEFAULT_ORB_VOICE_SIZE,
  DEFAULT_ORB_VOICE_STATE,
  ORB_VOICE_COLOR_KEYS
} from '@core/config.data'
import { ORB_VOICE_APPEARANCE_BY_STATE } from '@core/motion/motion.data'
import type { OrbVoiceAnimationLayers, OrbVoiceShadowTree } from '@element/element.types'

export function orbVoiceShadowTreeFactory(shadowRoot: ShadowRoot, document: Document): OrbVoiceShadowTree {
  const style = document.createElement('style')
  style.textContent = styles

  const root = createLayer(document, 'div', 'orb-voice-root', 'root')
  root.setAttribute('aria-hidden', 'true')
  seedDefaultStyles(root)

  const aura = createLayer(document, 'span', 'orb-voice-aura', 'aura')
  const ring = createLayer(document, 'span', 'orb-voice-ring', 'ring')
  const sphere = createLayer(document, 'span', 'orb-voice-sphere')
  const field = createLayer(document, 'span', 'orb-voice-field', 'field')
  const texture = createLayer(document, 'span', 'orb-voice-texture')
  const core = createLayer(document, 'span', 'orb-voice-core', 'core')
  const highlight = createLayer(document, 'span', 'orb-voice-highlight', 'highlight')

  sphere.append(field, texture, core, highlight)
  root.append(aura, ring, sphere)
  shadowRoot.append(style, root)

  const layers: OrbVoiceAnimationLayers = {
    aura,
    core,
    field,
    highlight,
    ring,
    root
  }

  return { layers, root }
}

function seedDefaultStyles(root: HTMLElement): void {
  for (const key of ORB_VOICE_COLOR_KEYS) {
    root.style.setProperty(`--orb-voice-${key}`, DEFAULT_ORB_VOICE_COLORS[key])
  }

  const appearance = ORB_VOICE_APPEARANCE_BY_STATE[DEFAULT_ORB_VOICE_STATE]
  root.style.setProperty('--orb-voice-contrast', String(appearance.contrast))
  root.style.setProperty('--orb-voice-saturation', String(appearance.saturation))
  root.style.setProperty('--orb-voice-size', DEFAULT_ORB_VOICE_SIZE)
}

function createLayer<K extends keyof HTMLElementTagNameMap>(
  document: Document,
  tagName: K,
  className: string,
  layerName?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName)
  element.className = className

  if (layerName) {
    element.dataset.layer = layerName
  }

  return element
}
