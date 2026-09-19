import type { OrbVDeepReadonly } from '@core/config.types'

/** Freeze a configuration tree once at its ownership boundary. */
export function deepFreezeOrbVConfiguration<T>(value: T): OrbVDeepReadonly<T> {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) {
      deepFreezeOrbVConfiguration(child)
    }
    Object.freeze(value)
  }

  return value as OrbVDeepReadonly<T>
}
