import type { OrbVPresetName } from '@core/appearance/appearance.types'
import { ORBV_PRESET_NAMES } from '@core/config.data'

export function isOrbVPresetName(value: unknown): value is OrbVPresetName {
  return (
    typeof value === 'string' &&
    (value === 'gojhonny' || (ORBV_PRESET_NAMES as readonly string[]).includes(value))
  )
}
