import { DEFAULT_ORBV_PRESET } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { isOrbVPresetName } from './is-preset-name.guard'
import { normalizeOrbVPreset } from './normalize-preset.compute'

describe('core/normalize-preset', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbVPreset('unknown')).toBe(DEFAULT_ORBV_PRESET)
  })

  it('accepts NeonGate and normalizes the deprecated published alias', () => {
    expect(isOrbVPresetName('neongate')).toBe(true)
    expect(isOrbVPresetName('gojhonny')).toBe(true)
    expect(normalizeOrbVPreset('neongate')).toBe('neongate')
    expect(normalizeOrbVPreset('gojhonny')).toBe('neongate')
    expect(normalizeOrbVPreset('peach')).toBe('peach')
    expect(isOrbVPresetName('unknown')).toBe(false)
  })
})
