import { DEFAULT_ORBU_PRESET } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { isOrbuPresetName } from './is-preset-name.guard'
import { normalizeOrbuPreset } from './normalize-preset.compute'

describe('core/normalize-preset', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbuPreset('unknown')).toBe(DEFAULT_ORBU_PRESET)
  })

  it('accepts NeonGate and normalizes the deprecated published alias', () => {
    expect(isOrbuPresetName('neongate')).toBe(true)
    expect(isOrbuPresetName('gojhonny')).toBe(true)
    expect(normalizeOrbuPreset('neongate')).toBe('neongate')
    expect(normalizeOrbuPreset('gojhonny')).toBe('neongate')
    expect(normalizeOrbuPreset('peach')).toBe('peach')
    expect(isOrbuPresetName('unknown')).toBe(false)
  })
})
