import type { OrbVoiceColorOverrides, OrbVoiceColors } from '@core/appearance/appearance.types'
import { DEFAULT_ORB_VOICE_COLORS, ORB_VOICE_COLOR_KEYS } from '@core/config.data'

export function mergeOrbVoiceColors(
  colors?: OrbVoiceColorOverrides | null,
  base: Readonly<OrbVoiceColors> = DEFAULT_ORB_VOICE_COLORS
): OrbVoiceColors {
  const merged = { ...base } as OrbVoiceColors

  if (!colors) {
    return merged
  }

  for (const key of ORB_VOICE_COLOR_KEYS) {
    const value = colors[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      merged[key] = value.trim()
    }
  }

  return merged
}
