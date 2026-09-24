import type {
  OrbuAnimationValues,
  OrbuMotionProfile,
  OrbuTransition
} from '@core/motion/motion.types'

export type OrbuStates = readonly ['idle', 'listening', 'thinking', 'speaking', 'asleep']
export type OrbuReducedMotionModes = readonly ['system', 'always', 'never']
export type OrbuPresetNames = readonly [
  'neongate',
  'periwinkle',
  'magenta',
  'peach',
  'mocha',
  'ivory'
]
/** @deprecated Use the canonical NeonGate identifier in new configuration. */
type LegacyPresetNames = readonly ['gojhonny', ...OmitFirst<OrbuPresetNames>]
type OmitFirst<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest]
  ? Rest
  : never
export type OrbuColorKeys = readonly ['accent', 'background', 'highlight', 'primary', 'secondary']

type State = OrbuStates[number]
type Preset = OrbuPresetNames[number]
type Color = OrbuColorKeys[number]
type Layer = 'aura' | 'core' | 'field' | 'highlight' | 'ring' | 'root'

export type OrbuDeepReadonly<T> = T extends object
  ? { readonly [Key in keyof T]: OrbuDeepReadonly<T[Key]> }
  : T

export interface OrbuSerializedLayerMotion {
  animate: OrbuAnimationValues
  transition: Omit<OrbuTransition, 'repeat'> & { repeat?: number | 'infinite' }
}

export interface OrbuComponentConfiguration {
  tagName: 'orb-u'
  states: OrbuStates
  reducedMotionModes: OrbuReducedMotionModes
  defaultState: State
  defaultSize: string
  defaultSpeed: number
  defaultReducedMotion: OrbuReducedMotionModes[number]
  /** Base attributes in source JSON; includes derived color attributes at runtime. */
  observedAttributes: readonly string[]
}

export interface OrbuAppearanceConfiguration {
  defaultPreset: Preset
  presetNames: OrbuPresetNames
  colorKeys: OrbuColorKeys
  colorAttributes: { [Key in Color]: `color-${Key}` }
  presets: Record<Preset, Record<Color, string>>
  byState: Record<State, { contrast: number; saturation: number }>
}

/** Compatibility input for the preset identifier accidentally published in 1.0.1. */
interface LegacyAppearanceConfiguration
  extends Omit<OrbuAppearanceConfiguration, 'defaultPreset' | 'presetNames' | 'presets'> {
  defaultPreset: LegacyPresetNames[number]
  presetNames: LegacyPresetNames
  presets: Record<LegacyPresetNames[number], Record<Color, string>>
}

interface OrbuRuntimeAppearanceConfiguration extends OrbuAppearanceConfiguration {
  presets: OrbuAppearanceConfiguration['presets'] & {
    /** @deprecated Use neongate; retained as a non-enumerable palette alias. */
    gojhonny: Record<Color, string>
  }
}

export interface OrbuMotionConfigurationSource {
  animatedStyleProperties: readonly string[]
  easings: { easeInOut: string; easeOut: string; linear: string }
  full: Record<State, Record<Layer, OrbuSerializedLayerMotion>>
  reduced: Record<State, Record<Layer, OrbuSerializedLayerMotion>>
}

export interface OrbuSpeechConfiguration {
  defaultVoiceModel: null | 'web-speech' | 'openai-speech' | 'openai-realtime'
  models: readonly ['web-speech', 'openai-speech', 'openai-realtime']
  /** Package defaults intentionally contain no consumer conversation copy. */
  talk: Record<string, never>
  defaultTalkFlow: readonly never[]
  tokenPattern: { source: string; flags: string }
  webSpeech: {
    language: string
    pitch: number
    rate: number
    volume: number
    preferredVoices: readonly string[]
    voiceLoadTimeoutMs: number
    speechStartTimeoutMs: number
  }
  openaiSpeech: {
    model: string
    responseFormat: 'aac' | 'flac' | 'mp3' | 'opus' | 'wav'
    voice: string
    legacyVoice: string
    instructions: string
    credentials: RequestCredentials
    requestTimeoutMs: number
  }
}

export interface OrbuRealtimeConfiguration {
  maxEventBytes: number
  maxTranscriptLength: number
  openai: {
    model: string
    voice: string
    credentials: RequestCredentials
    sessionTimeoutMs: number
    dataChannelLabel: string
  }
}

/** Compact build input; legacy internal overrides remain supported. */
export interface OrbuConfigurationSource {
  component: OrbuComponentConfiguration
  appearance: (
    | Omit<OrbuAppearanceConfiguration, 'byState'>
    | Omit<LegacyAppearanceConfiguration, 'byState'>
  ) & {
    byState?: OrbuAppearanceConfiguration['byState']
  }
  motion?: OrbuMotionConfigurationSource
  speech?: OrbuSpeechConfiguration
  realtime: OrbuRealtimeConfiguration
}

/** Validated source after composing omitted internal defaults. */
export interface OrbuResolvedConfigurationSource
  extends Omit<OrbuConfigurationSource, 'appearance' | 'motion' | 'speech'> {
  appearance: OrbuAppearanceConfiguration
  motion: OrbuMotionConfigurationSource
  speech: OrbuSpeechConfiguration
}

export interface OrbuMotionConfiguration
  extends Omit<OrbuMotionConfigurationSource, 'full' | 'reduced'> {
  full: Record<State, OrbuMotionProfile>
  reduced: Record<State, OrbuMotionProfile>
}

export interface OrbuRuntimeConfiguration
  extends Omit<OrbuResolvedConfigurationSource, 'appearance' | 'motion'> {
  appearance: OrbuRuntimeAppearanceConfiguration
  motion: OrbuMotionConfiguration
}

export type OrbuConfiguration = OrbuDeepReadonly<OrbuRuntimeConfiguration>

/** The bundled defaults retain the same accurate configurable contracts. */
export type OrbuBundledConfiguration = OrbuConfiguration
