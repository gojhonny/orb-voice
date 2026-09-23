import bundledSource from '@configuration'
import { transformOrbVoiceConfiguration } from '@core/lib/transform-configuration.compute'

import type { OrbVoiceBundledConfiguration } from './config.types'

// The JSON is bundled into every entry point; importing never performs I/O.
export const orbVoiceConfiguration = transformOrbVoiceConfiguration(
  bundledSource
) as OrbVoiceBundledConfiguration
