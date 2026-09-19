import type { OrbVPresetName } from '@core/appearance/appearance.types'
import { DEFAULT_ORBV_PRESET } from '@core/config.data'

import { isOrbVPresetName } from './is-preset-name.guard'

export function normalizeOrbVPreset(value: unknown): OrbVPresetName {
  if (value === 'gojhonny') return 'neongate'
  return isOrbVPresetName(value) ? value : DEFAULT_ORBV_PRESET
}
