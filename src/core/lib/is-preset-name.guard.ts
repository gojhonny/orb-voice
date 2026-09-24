import type { OrbuPresetName } from '@core/appearance/appearance.types'
import { ORBU_PRESET_NAMES } from '@core/config.data'

export function isOrbuPresetName(value: unknown): value is OrbuPresetName {
  return (
    typeof value === 'string' &&
    (value === 'gojhonny' || (ORBU_PRESET_NAMES as readonly string[]).includes(value))
  )
}
