import type { OrbuPresetName } from '@core/appearance/appearance.types'
import { DEFAULT_ORBU_PRESET } from '@core/config.data'

import { isOrbuPresetName } from './is-preset-name.guard'

export function normalizeOrbuPreset(value: unknown): OrbuPresetName {
  if (value === 'gojhonny') return 'neongate'
  return isOrbuPresetName(value) ? value : DEFAULT_ORBU_PRESET
}
