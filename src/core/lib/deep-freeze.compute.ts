import type { OrbVoiceDeepReadonly } from '@core/config.types'

/** Freeze a configuration tree once at its ownership boundary. */
export function deepFreezeOrbVoiceConfiguration<T>(value: T): OrbVoiceDeepReadonly<T> {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) {
      deepFreezeOrbVoiceConfiguration(child)
    }
    Object.freeze(value)
  }

  return value as OrbVoiceDeepReadonly<T>
}
