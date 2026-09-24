import bundledSource from '@configuration'
import { transformOrbuConfiguration } from '@core/lib/transform-configuration.compute'

import type { OrbuBundledConfiguration } from './config.types'

// The JSON is bundled into every entry point; importing never performs I/O.
export const orbuConfiguration = transformOrbuConfiguration(
  bundledSource
) as OrbuBundledConfiguration
