import {
  DEFAULT_ORB_VOICE_COLORS,
  DEFAULT_ORB_VOICE_PRESET,
  ORB_VOICE_PRESET_NAMES,
  ORB_VOICE_PRESETS,
  orbVoiceConfiguration
} from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { mergeOrbVoiceColors } from './merge-colors.compute'

describe('core/merge-colors', () => {
  it('preserves the established NeonGate name and five-color palette', () => {
    expect(DEFAULT_ORB_VOICE_PRESET).toBe('neongate')
    expect(mergeOrbVoiceColors()).toEqual({
      accent: '#FF4DDE',
      background: '#14142B',
      highlight: '#FFB07A',
      primary: '#6C5CFF',
      secondary: '#00E9FF'
    })
  })

  it('enumerates six canonical presets while preserving the deprecated palette alias', () => {
    expect(ORB_VOICE_PRESET_NAMES).toEqual([
      'neongate',
      'periwinkle',
      'magenta',
      'peach',
      'mocha',
      'ivory'
    ])
    expect(Object.keys(ORB_VOICE_PRESETS)).toEqual(ORB_VOICE_PRESET_NAMES)
    expect(ORB_VOICE_PRESETS.gojhonny).toBe(ORB_VOICE_PRESETS.neongate)
    expect(orbVoiceConfiguration.appearance.presets).toBe(ORB_VOICE_PRESETS)
    expect(Object.isFrozen(ORB_VOICE_PRESETS.gojhonny)).toBe(true)
    expect(Reflect.set(ORB_VOICE_PRESETS, 'gojhonny', {})).toBe(false)
    expect(Reflect.set(ORB_VOICE_PRESETS.gojhonny, 'primary', '#000000')).toBe(false)
  })

  it('merges an override without mutating the default preset', () => {
    const colors = mergeOrbVoiceColors({ primary: '#000000' })

    expect(colors).toEqual({ ...DEFAULT_ORB_VOICE_COLORS, primary: '#000000' })
    expect(ORB_VOICE_PRESETS.neongate.primary).not.toBe('#000000')
  })
})
