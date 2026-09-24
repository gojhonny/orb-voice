import type { OrboPresetName } from '@core/appearance/appearance.types'
import { DEFAULT_ORBO_PRESET } from '@core/config.data'

import { isOrboPresetName } from './is-preset-name.guard'

export function normalizeOrboPreset(value: unknown): OrboPresetName {
  if (value === 'gojhonny') return 'neongate'
  return isOrboPresetName(value) ? value : DEFAULT_ORBO_PRESET
}
