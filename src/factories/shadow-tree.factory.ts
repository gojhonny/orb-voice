import styles from 'virtual:orbv-styles'

import {
  DEFAULT_ORBV_COLORS,
  DEFAULT_ORBV_SIZE,
  DEFAULT_ORBV_STATE,
  ORBV_COLOR_KEYS
} from '@core/config.data'
import { ORBV_APPEARANCE_BY_STATE } from '@core/motion/motion.data'
import type { OrbVAnimationLayers, OrbVShadowTree } from '@element/element.types'

export function orbvShadowTreeFactory(shadowRoot: ShadowRoot, document: Document): OrbVShadowTree {
  const style = document.createElement('style')
  style.textContent = styles

  const root = createLayer(document, 'div', 'orbv-root', 'root')
  root.setAttribute('aria-hidden', 'true')
  seedDefaultStyles(root)

  const aura = createLayer(document, 'span', 'orbv-aura', 'aura')
  const ring = createLayer(document, 'span', 'orbv-ring', 'ring')
  const sphere = createLayer(document, 'span', 'orbv-sphere')
  const field = createLayer(document, 'span', 'orbv-field', 'field')
  const texture = createLayer(document, 'span', 'orbv-texture')
  const core = createLayer(document, 'span', 'orbv-core', 'core')
  const highlight = createLayer(document, 'span', 'orbv-highlight', 'highlight')

  sphere.append(field, texture, core, highlight)
  root.append(aura, ring, sphere)
  shadowRoot.append(style, root)

  const layers: OrbVAnimationLayers = {
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
  for (const key of ORBV_COLOR_KEYS) {
    root.style.setProperty(`--orbv-${key}`, DEFAULT_ORBV_COLORS[key])
  }

  const appearance = ORBV_APPEARANCE_BY_STATE[DEFAULT_ORBV_STATE]
  root.style.setProperty('--orbv-contrast', String(appearance.contrast))
  root.style.setProperty('--orbv-saturation', String(appearance.saturation))
  root.style.setProperty('--orbv-size', DEFAULT_ORBV_SIZE)
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
