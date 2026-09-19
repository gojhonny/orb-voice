import type { OrbVColorOverrides, OrbVColors } from '@core/appearance/appearance.types'
import { DEFAULT_ORBV_COLORS, ORBV_COLOR_KEYS } from '@core/config.data'

export function mergeOrbVColors(
  colors?: OrbVColorOverrides | null,
  base: Readonly<OrbVColors> = DEFAULT_ORBV_COLORS
): OrbVColors {
  const merged = { ...base } as OrbVColors

  if (!colors) {
    return merged
  }

  for (const key of ORBV_COLOR_KEYS) {
    const value = colors[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      merged[key] = value.trim()
    }
  }

  return merged
}
