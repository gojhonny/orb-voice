import type {
  OrboAnimationValues,
  OrboMotionProfile,
  OrboTransition
} from '@core/motion/motion.types'

export type OrboStates = readonly ['idle', 'listening', 'thinking', 'speaking', 'asleep']
export type OrboReducedMotionModes = readonly ['system', 'always', 'never']
export type OrboPresetNames = readonly [
  'neongate',
  'periwinkle',
  'magenta',
  'peach',
  'mocha',
  'ivory'
]
/** @deprecated Use the canonical NeonGate identifier in new configuration. */
type LegacyPresetNames = readonly ['gojhonny', ...OmitFirst<OrboPresetNames>]
type OmitFirst<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest]
  ? Rest
  : never
export type OrboColorKeys = readonly ['accent', 'background', 'highlight', 'primary', 'secondary']

type State = OrboStates[number]
type Preset = OrboPresetNames[number]
type Color = OrboColorKeys[number]
type Layer = 'aura' | 'core' | 'field' | 'highlight' | 'ring' | 'root'

export type OrboDeepReadonly<T> = T extends object
  ? { readonly [Key in keyof T]: OrboDeepReadonly<T[Key]> }
  : T

export interface OrboSerializedLayerMotion {
  animate: OrboAnimationValues
  transition: Omit<OrboTransition, 'repeat'> & { repeat?: number | 'infinite' }
}

export interface OrboComponentConfiguration {
  tagName: 'orb-o'
  states: OrboStates
  reducedMotionModes: OrboReducedMotionModes
  defaultState: State
  defaultSize: string
  defaultSpeed: number
  defaultReducedMotion: OrboReducedMotionModes[number]
  /** Base attributes in source JSON; includes derived color attributes at runtime. */
  observedAttributes: readonly string[]
}

export interface OrboAppearanceConfiguration {
  defaultPreset: Preset
  presetNames: OrboPresetNames
  colorKeys: OrboColorKeys
  colorAttributes: { [Key in Color]: `color-${Key}` }
  presets: Record<Preset, Record<Color, string>>
  byState: Record<State, { contrast: number; saturation: number }>
}

/** Compatibility input for the preset identifier accidentally published in 1.0.1. */
interface LegacyAppearanceConfiguration
  extends Omit<OrboAppearanceConfiguration, 'defaultPreset' | 'presetNames' | 'presets'> {
  defaultPreset: LegacyPresetNames[number]
  presetNames: LegacyPresetNames
  presets: Record<LegacyPresetNames[number], Record<Color, string>>
}

interface OrboRuntimeAppearanceConfiguration extends OrboAppearanceConfiguration {
  presets: OrboAppearanceConfiguration['presets'] & {
    /** @deprecated Use neongate; retained as a non-enumerable palette alias. */
    gojhonny: Record<Color, string>
  }
}

export interface OrboMotionConfigurationSource {
  animatedStyleProperties: readonly string[]
  easings: { easeInOut: string; easeOut: string; linear: string }
  full: Record<State, Record<Layer, OrboSerializedLayerMotion>>
  reduced: Record<State, Record<Layer, OrboSerializedLayerMotion>>
}

export interface OrboSpeechConfiguration {
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

export interface OrboRealtimeConfiguration {
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
export interface OrboConfigurationSource {
  component: OrboComponentConfiguration
  appearance: (
    | Omit<OrboAppearanceConfiguration, 'byState'>
    | Omit<LegacyAppearanceConfiguration, 'byState'>
  ) & {
    byState?: OrboAppearanceConfiguration['byState']
  }
  motion?: OrboMotionConfigurationSource
  speech?: OrboSpeechConfiguration
  realtime: OrboRealtimeConfiguration
}

/** Validated source after composing omitted internal defaults. */
export interface OrboResolvedConfigurationSource
  extends Omit<OrboConfigurationSource, 'appearance' | 'motion' | 'speech'> {
  appearance: OrboAppearanceConfiguration
  motion: OrboMotionConfigurationSource
  speech: OrboSpeechConfiguration
}

export interface OrboMotionConfiguration
  extends Omit<OrboMotionConfigurationSource, 'full' | 'reduced'> {
  full: Record<State, OrboMotionProfile>
  reduced: Record<State, OrboMotionProfile>
}

export interface OrboRuntimeConfiguration
  extends Omit<OrboResolvedConfigurationSource, 'appearance' | 'motion'> {
  appearance: OrboRuntimeAppearanceConfiguration
  motion: OrboMotionConfiguration
}

export type OrboConfiguration = OrboDeepReadonly<OrboRuntimeConfiguration>

/** The bundled defaults retain the same accurate configurable contracts. */
export type OrboBundledConfiguration = OrboConfiguration
