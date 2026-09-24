import type { OrboDeepReadonly } from '@core/config.types'

/** Freeze a configuration tree once at its ownership boundary. */
export function deepFreezeOrboConfiguration<T>(value: T): OrboDeepReadonly<T> {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) {
      deepFreezeOrboConfiguration(child)
    }
    Object.freeze(value)
  }

  return value as OrboDeepReadonly<T>
}
