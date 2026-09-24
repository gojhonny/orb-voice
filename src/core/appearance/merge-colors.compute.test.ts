import {
  DEFAULT_ORBO_COLORS,
  DEFAULT_ORBO_PRESET,
  ORBO_PRESET_NAMES,
  ORBO_PRESETS,
  orboConfiguration
} from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { mergeOrboColors } from './merge-colors.compute'

describe('core/merge-colors', () => {
  it('preserves the established NeonGate name and five-color palette', () => {
    expect(DEFAULT_ORBO_PRESET).toBe('neongate')
    expect(mergeOrboColors()).toEqual({
      accent: '#FF4DDE',
      background: '#14142B',
      highlight: '#FFB07A',
      primary: '#6C5CFF',
      secondary: '#00E9FF'
    })
  })

  it('enumerates six canonical presets while preserving the deprecated palette alias', () => {
    expect(ORBO_PRESET_NAMES).toEqual([
      'neongate',
      'periwinkle',
      'magenta',
      'peach',
      'mocha',
      'ivory'
    ])
    expect(Object.keys(ORBO_PRESETS)).toEqual(ORBO_PRESET_NAMES)
    expect(ORBO_PRESETS.gojhonny).toBe(ORBO_PRESETS.neongate)
    expect(orboConfiguration.appearance.presets).toBe(ORBO_PRESETS)
    expect(Object.isFrozen(ORBO_PRESETS.gojhonny)).toBe(true)
    expect(Reflect.set(ORBO_PRESETS, 'gojhonny', {})).toBe(false)
    expect(Reflect.set(ORBO_PRESETS.gojhonny, 'primary', '#000000')).toBe(false)
  })

  it('merges an override without mutating the default preset', () => {
    const colors = mergeOrboColors({ primary: '#000000' })

    expect(colors).toEqual({ ...DEFAULT_ORBO_COLORS, primary: '#000000' })
    expect(ORBO_PRESETS.neongate.primary).not.toBe('#000000')
  })
})
