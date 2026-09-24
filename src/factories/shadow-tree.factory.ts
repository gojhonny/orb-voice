import styles from 'virtual:orbo-styles'

import {
  DEFAULT_ORBO_COLORS,
  DEFAULT_ORBO_SIZE,
  DEFAULT_ORBO_STATE,
  ORBO_COLOR_KEYS
} from '@core/config.data'
import { ORBO_APPEARANCE_BY_STATE } from '@core/motion/motion.data'
import type { OrboAnimationLayers, OrboShadowTree } from '@element/element.types'

export function orboShadowTreeFactory(shadowRoot: ShadowRoot, document: Document): OrboShadowTree {
  const style = document.createElement('style')
  style.textContent = styles

  const root = createLayer(document, 'div', 'orbo-root', 'root')
  root.setAttribute('aria-hidden', 'true')
  seedDefaultStyles(root)

  const aura = createLayer(document, 'span', 'orbo-aura', 'aura')
  const ring = createLayer(document, 'span', 'orbo-ring', 'ring')
  const sphere = createLayer(document, 'span', 'orbo-sphere')
  const field = createLayer(document, 'span', 'orbo-field', 'field')
  const texture = createLayer(document, 'span', 'orbo-texture')
  const core = createLayer(document, 'span', 'orbo-core', 'core')
  const highlight = createLayer(document, 'span', 'orbo-highlight', 'highlight')

  sphere.append(field, texture, core, highlight)
  root.append(aura, ring, sphere)
  shadowRoot.append(style, root)

  const layers: OrboAnimationLayers = {
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
  for (const key of ORBO_COLOR_KEYS) {
    root.style.setProperty(`--orbo-${key}`, DEFAULT_ORBO_COLORS[key])
  }

  const appearance = ORBO_APPEARANCE_BY_STATE[DEFAULT_ORBO_STATE]
  root.style.setProperty('--orbo-contrast', String(appearance.contrast))
  root.style.setProperty('--orbo-saturation', String(appearance.saturation))
  root.style.setProperty('--orbo-size', DEFAULT_ORBO_SIZE)
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
