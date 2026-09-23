import type { OrbVoicePresetName } from '@core/appearance/appearance.types'
import { DEFAULT_ORB_VOICE_PRESET } from '@core/config.data'

import { isOrbVoicePresetName } from './is-preset-name.guard'

export function normalizeOrbVoicePreset(value: unknown): OrbVoicePresetName {
  if (value === 'gojhonny') return 'neongate'
  return isOrbVoicePresetName(value) ? value : DEFAULT_ORB_VOICE_PRESET
}
