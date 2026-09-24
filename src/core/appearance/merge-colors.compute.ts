import type { OrboColorOverrides, OrboColors } from '@core/appearance/appearance.types'
import { DEFAULT_ORBO_COLORS, ORBO_COLOR_KEYS } from '@core/config.data'

export function mergeOrboColors(
  colors?: OrboColorOverrides | null,
  base: Readonly<OrboColors> = DEFAULT_ORBO_COLORS
): OrboColors {
  const merged = { ...base } as OrboColors

  if (!colors) {
    return merged
  }

  for (const key of ORBO_COLOR_KEYS) {
    const value = colors[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      merged[key] = value.trim()
    }
  }

  return merged
}
