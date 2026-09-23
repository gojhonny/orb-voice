import type {
  OrbVoiceConfiguration,
  OrbVoiceMotionConfigurationSource,
  OrbVoiceResolvedConfigurationSource,
  OrbVoiceSerializedLayerMotion
} from '@core/config.types'
import type { OrbVoiceLayerMotion, OrbVoiceMotionProfile } from '@core/motion/motion.types'

import { deepFreezeOrbVoiceConfiguration } from './deep-freeze.compute'
import { readOrbVoiceConfigurationSource } from './validate-configuration.compute'

/**
 * Validate serializable configuration and derive an isolated, deeply readonly
 * runtime tree. Invalid input throws TypeError with a schema path and no values.
 * This function does not read files, fetch resources or initialize browser APIs.
 */
export function transformOrbVoiceConfiguration(input: unknown): OrbVoiceConfiguration {
  const source = readOrbVoiceConfigurationSource(input)
  // Keep the published palette lookup without exposing a seventh preset.
  const presets = Object.defineProperty(source.appearance.presets, 'gojhonny', {
    value: source.appearance.presets.neongate,
    enumerable: false
  }) as OrbVoiceConfiguration['appearance']['presets']
  return deepFreezeOrbVoiceConfiguration({
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
  profiles: OrbVoiceMotionConfigurationSource['full'],
  appearance: OrbVoiceResolvedConfigurationSource['appearance']['byState']
): Record<OrbVoiceResolvedConfigurationSource['component']['states'][number], OrbVoiceMotionProfile> {
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
  ) as Record<OrbVoiceResolvedConfigurationSource['component']['states'][number], OrbVoiceMotionProfile>
}

function layerMotion(layer: OrbVoiceSerializedLayerMotion): OrbVoiceLayerMotion {
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
