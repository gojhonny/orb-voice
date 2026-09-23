import bundledSource from '@configuration'
import { transformOrbVConfiguration } from '@core/lib/transform-configuration.compute'

import type { OrbVBundledConfiguration } from './config.types'

// The JSON is bundled into every entry point; importing never performs I/O.
export const orbvConfiguration = transformOrbVConfiguration(
  bundledSource
) as OrbVBundledConfiguration
