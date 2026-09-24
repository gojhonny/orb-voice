import type { OrbuColorOverrides, OrbuColors } from '@core/appearance/appearance.types'
import { DEFAULT_ORBU_COLORS, ORBU_COLOR_KEYS } from '@core/config.data'

export function mergeOrbuColors(
  colors?: OrbuColorOverrides | null,
  base: Readonly<OrbuColors> = DEFAULT_ORBU_COLORS
): OrbuColors {
  const merged = { ...base } as OrbuColors

  if (!colors) {
    return merged
  }

  for (const key of ORBU_COLOR_KEYS) {
    const value = colors[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      merged[key] = value.trim()
    }
  }

  return merged
}
