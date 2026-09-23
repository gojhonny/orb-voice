import {
  DEFAULT_ORBV_COLORS,
  DEFAULT_ORBV_PRESET,
  ORBV_PRESET_NAMES,
  ORBV_PRESETS,
  orbvConfiguration
} from '@core/config.data'
import { describe, expect, it } from 'vitest'
import { mergeOrbVColors } from './merge-colors.compute'

describe('core/merge-colors', () => {
  it('preserves the established NeonGate name and five-color palette', () => {
    expect(DEFAULT_ORBV_PRESET).toBe('neongate')
    expect(mergeOrbVColors()).toEqual({
      accent: '#FF4DDE',
      background: '#14142B',
      highlight: '#FFB07A',
      primary: '#6C5CFF',
      secondary: '#00E9FF'
    })
  })

  it('enumerates six canonical presets while preserving the deprecated palette alias', () => {
    expect(ORBV_PRESET_NAMES).toEqual([
      'neongate',
      'periwinkle',
      'magenta',
      'peach',
      'mocha',
      'ivory'
    ])
    expect(Object.keys(ORBV_PRESETS)).toEqual(ORBV_PRESET_NAMES)
    expect(ORBV_PRESETS.gojhonny).toBe(ORBV_PRESETS.neongate)
    expect(orbvConfiguration.appearance.presets).toBe(ORBV_PRESETS)
    expect(Object.isFrozen(ORBV_PRESETS.gojhonny)).toBe(true)
    expect(Reflect.set(ORBV_PRESETS, 'gojhonny', {})).toBe(false)
    expect(Reflect.set(ORBV_PRESETS.gojhonny, 'primary', '#000000')).toBe(false)
  })

  it('merges an override without mutating the default preset', () => {
    const colors = mergeOrbVColors({ primary: '#000000' })

    expect(colors).toEqual({ ...DEFAULT_ORBV_COLORS, primary: '#000000' })
    expect(ORBV_PRESETS.neongate.primary).not.toBe('#000000')
  })
})
