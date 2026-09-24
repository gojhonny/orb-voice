import { DEFAULT_ORB_VOICE_PRESET } from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { isOrbVoicePresetName } from './is-preset-name.guard'
import { normalizeOrbVoicePreset } from './normalize-preset.compute'

describe('core/normalize-preset', () => {
  it('normalizes invalid input to the stable default', () => {
    expect(normalizeOrbVoicePreset('unknown')).toBe(DEFAULT_ORB_VOICE_PRESET)
  })

  it('accepts NeonGate and normalizes the deprecated published alias', () => {
    expect(isOrbVoicePresetName('neongate')).toBe(true)
    expect(isOrbVoicePresetName('gojhonny')).toBe(true)
    expect(normalizeOrbVoicePreset('neongate')).toBe('neongate')
    expect(normalizeOrbVoicePreset('gojhonny')).toBe('neongate')
    expect(normalizeOrbVoicePreset('peach')).toBe('peach')
    expect(isOrbVoicePresetName('unknown')).toBe(false)
  })
})
