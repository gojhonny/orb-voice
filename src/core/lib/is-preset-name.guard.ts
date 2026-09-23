import type { OrbVoicePresetName } from '@core/appearance/appearance.types'
import { ORB_VOICE_PRESET_NAMES } from '@core/config.data'

export function isOrbVoicePresetName(value: unknown): value is OrbVoicePresetName {
  return (
    typeof value === 'string' &&
    (value === 'gojhonny' || (ORB_VOICE_PRESET_NAMES as readonly string[]).includes(value))
  )
}
