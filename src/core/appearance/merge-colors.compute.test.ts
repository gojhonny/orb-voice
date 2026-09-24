import {
  DEFAULT_ORBU_COLORS,
  DEFAULT_ORBU_PRESET,
  ORBU_PRESET_NAMES,
  ORBU_PRESETS,
  orbuConfiguration
} from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { mergeOrbuColors } from './merge-colors.compute'

describe('core/merge-colors', () => {
  it('preserves the established NeonGate name and five-color palette', () => {
    expect(DEFAULT_ORBU_PRESET).toBe('neongate')
    expect(mergeOrbuColors()).toEqual({
      accent: '#FF4DDE',
      background: '#14142B',
      highlight: '#FFB07A',
      primary: '#6C5CFF',
      secondary: '#00E9FF'
    })
  })

  it('enumerates six canonical presets while preserving the deprecated palette alias', () => {
    expect(ORBU_PRESET_NAMES).toEqual([
      'neongate',
      'periwinkle',
      'magenta',
      'peach',
      'mocha',
      'ivory'
    ])
    expect(Object.keys(ORBU_PRESETS)).toEqual(ORBU_PRESET_NAMES)
    expect(ORBU_PRESETS.gojhonny).toBe(ORBU_PRESETS.neongate)
    expect(orbuConfiguration.appearance.presets).toBe(ORBU_PRESETS)
    expect(Object.isFrozen(ORBU_PRESETS.gojhonny)).toBe(true)
    expect(Reflect.set(ORBU_PRESETS, 'gojhonny', {})).toBe(false)
    expect(Reflect.set(ORBU_PRESETS.gojhonny, 'primary', '#000000')).toBe(false)
  })

  it('merges an override without mutating the default preset', () => {
    const colors = mergeOrbuColors({ primary: '#000000' })

    expect(colors).toEqual({ ...DEFAULT_ORBU_COLORS, primary: '#000000' })
    expect(ORBU_PRESETS.neongate.primary).not.toBe('#000000')
  })
})
