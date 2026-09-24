import type {
  OrboConfiguration,
  OrboMotionConfigurationSource,
  OrboResolvedConfigurationSource,
  OrboSerializedLayerMotion
} from '@core/config.types'
import type { OrboLayerMotion, OrboMotionProfile } from '@core/motion/motion.types'

import { deepFreezeOrboConfiguration } from './deep-freeze.compute'
import { readOrboConfigurationSource } from './validate-configuration.compute'

/**
 * Validate serializable configuration and derive an isolated, deeply readonly
 * runtime tree. Invalid input throws TypeError with a schema path and no values.
 * This function does not read files, fetch resources or initialize browser APIs.
 */
export function transformOrboConfiguration(input: unknown): OrboConfiguration {
  const source = readOrboConfigurationSource(input)
  // Keep the published palette lookup without exposing a seventh preset.
  const presets = Object.defineProperty(source.appearance.presets, 'gojhonny', {
    value: source.appearance.presets.neongate,
    enumerable: false
  }) as OrboConfiguration['appearance']['presets']
  return deepFreezeOrboConfiguration({
    ...source,
    appearance: { ...source.appearance, presets },
    component: {
      ...source.component,
      observedAttributes: [
        ...source.component.observedAttributes,
        ...Object.values(source.appearance.colorAttributes)
      ]
    },
    motion: {
      ...source.motion,
      full: motionProfiles(source.motion.full, source.appearance.byState),
      reduced: motionProfiles(source.motion.reduced, source.appearance.byState)
    }
  })
}

function motionProfiles(
  profiles: OrboMotionConfigurationSource['full'],
  appearance: OrboResolvedConfigurationSource['appearance']['byState']
): Record<OrboResolvedConfigurationSource['component']['states'][number], OrboMotionProfile> {
  return Object.fromEntries(
    Object.entries(profiles).map(([state, layers]) => [
      state,
      {
        ...appearance[state as keyof typeof appearance],
        aura: layerMotion(layers.aura),
        core: layerMotion(layers.core),
        field: layerMotion(layers.field),
        highlight: layerMotion(layers.highlight),
        ring: layerMotion(layers.ring),
        root: layerMotion(layers.root)
      }
    ])
  ) as Record<OrboResolvedConfigurationSource['component']['states'][number], OrboMotionProfile>
}

function layerMotion(layer: OrboSerializedLayerMotion): OrboLayerMotion {
  const { repeat, ...transition } = layer.transition
  return {
    animate: layer.animate,
    transition: {
      ...transition,
      ...(repeat === undefined
        ? {}
        : {
            repeat: repeat === 'infinite' ? Number.POSITIVE_INFINITY : repeat
          })
    }
  }
}
