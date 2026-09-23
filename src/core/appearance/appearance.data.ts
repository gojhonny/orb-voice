import type { OrbVAppearanceConfiguration } from '@core/config.types'
import { deepFreezeOrbVConfiguration } from '@core/lib/deep-freeze.compute'

/** Internal defaults restored from the pre-SPEC-025 configuration. */
export const ORBV_DEFAULT_APPEARANCE_BY_STATE = deepFreezeOrbVConfiguration({
  idle: {
    contrast: 1.48,
    saturation: 1.28
  },
  listening: {
    contrast: 1.52,
    saturation: 1.4
  },
  thinking: {
    contrast: 1.6,
    saturation: 1.42
  },
  speaking: {
    contrast: 1.58,
    saturation: 1.5
  },
  asleep: {
    contrast: 1.22,
    saturation: 0.72
  }
} satisfies OrbVAppearanceConfiguration['byState'])
