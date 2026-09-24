import bundledSource from '@configuration'
import { transformOrboConfiguration } from '@core/lib/transform-configuration.compute'

import type { OrboBundledConfiguration } from './config.types'

// The JSON is bundled into every entry point; importing never performs I/O.
export const orboConfiguration = transformOrboConfiguration(
  bundledSource
) as OrboBundledConfiguration
