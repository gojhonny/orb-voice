import styles from 'virtual:orbu-styles'

import {
  DEFAULT_ORBU_COLORS,
  DEFAULT_ORBU_SIZE,
  DEFAULT_ORBU_STATE,
  ORBU_COLOR_KEYS
} from '@core/config.data'
import { ORBU_APPEARANCE_BY_STATE } from '@core/motion/motion.data'
import type { OrbuAnimationLayers, OrbuShadowTree } from '@element/element.types'

export function orbuShadowTreeFactory(shadowRoot: ShadowRoot, document: Document): OrbuShadowTree {
  const style = document.createElement('style')
  style.textContent = styles

  const root = createLayer(document, 'div', 'orbu-root', 'root')
  root.setAttribute('aria-hidden', 'true')
  seedDefaultStyles(root)

  const aura = createLayer(document, 'span', 'orbu-aura', 'aura')
  const ring = createLayer(document, 'span', 'orbu-ring', 'ring')
  const sphere = createLayer(document, 'span', 'orbu-sphere')
  const field = createLayer(document, 'span', 'orbu-field', 'field')
  const texture = createLayer(document, 'span', 'orbu-texture')
  const core = createLayer(document, 'span', 'orbu-core', 'core')
  const highlight = createLayer(document, 'span', 'orbu-highlight', 'highlight')

  sphere.append(field, texture, core, highlight)
  root.append(aura, ring, sphere)
  shadowRoot.append(style, root)

  const layers: OrbuAnimationLayers = {
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
  for (const key of ORBU_COLOR_KEYS) {
    root.style.setProperty(`--orbu-${key}`, DEFAULT_ORBU_COLORS[key])
  }

  const appearance = ORBU_APPEARANCE_BY_STATE[DEFAULT_ORBU_STATE]
  root.style.setProperty('--orbu-contrast', String(appearance.contrast))
  root.style.setProperty('--orbu-saturation', String(appearance.saturation))
  root.style.setProperty('--orbu-size', DEFAULT_ORBU_SIZE)
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
