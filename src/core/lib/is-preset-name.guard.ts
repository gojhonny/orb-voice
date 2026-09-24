import type { OrboPresetName } from '@core/appearance/appearance.types'
import { ORBO_PRESET_NAMES } from '@core/config.data'

export function isOrboPresetName(value: unknown): value is OrboPresetName {
  return (
    typeof value === 'string' &&
    (value === 'gojhonny' || (ORBO_PRESET_NAMES as readonly string[]).includes(value))
  )
}
