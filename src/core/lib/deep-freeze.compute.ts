import type { OrbuDeepReadonly } from '@core/config.types'

/** Freeze a configuration tree once at its ownership boundary. */
export function deepFreezeOrbuConfiguration<T>(value: T): OrbuDeepReadonly<T> {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) {
      deepFreezeOrbuConfiguration(child)
    }
    Object.freeze(value)
  }

  return value as OrbuDeepReadonly<T>
}
