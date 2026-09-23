import type {
  OrbVoiceAnimationValues,
  OrbVoiceMotionProfile,
  OrbVoiceTransition
} from '@core/motion/motion.types'

export type OrbVoiceStates = readonly ['idle', 'listening', 'thinking', 'speaking', 'asleep']
export type OrbVoiceReducedMotionModes = readonly ['system', 'always', 'never']
export type OrbVoicePresetNames = readonly [
  'neongate',
  'periwinkle',
  'magenta',
  'peach',
  'mocha',
  'ivory'
]
/** @deprecated Use the canonical NeonGate identifier in new configuration. */
type LegacyPresetNames = readonly ['gojhonny', ...OmitFirst<OrbVoicePresetNames>]
type OmitFirst<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest]
  ? Rest
  : never
export type OrbVoiceColorKeys = readonly ['accent', 'background', 'highlight', 'primary', 'secondary']

type State = OrbVoiceStates[number]
type Preset = OrbVoicePresetNames[number]
type Color = OrbVoiceColorKeys[number]
type Layer = 'aura' | 'core' | 'field' | 'highlight' | 'ring' | 'root'

export type OrbVoiceDeepReadonly<T> = T extends object
  ? { readonly [Key in keyof T]: OrbVoiceDeepReadonly<T[Key]> }
  : T

export interface OrbVoiceSerializedLayerMotion {
  animate: OrbVoiceAnimationValues
  transition: Omit<OrbVoiceTransition, 'repeat'> & { repeat?: number | 'infinite' }
}

export interface OrbVoiceComponentConfiguration {
  tagName: 'orb-voice'
  states: OrbVoiceStates
  reducedMotionModes: OrbVoiceReducedMotionModes
  defaultState: State
  defaultSize: string
  defaultSpeed: number
  defaultReducedMotion: OrbVoiceReducedMotionModes[number]
  /** Base attributes in source JSON; includes derived color attributes at runtime. */
  observedAttributes: readonly string[]
}

export interface OrbVoiceAppearanceConfiguration {
  defaultPreset: Preset
  presetNames: OrbVoicePresetNames
  colorKeys: OrbVoiceColorKeys
  colorAttributes: { [Key in Color]: `color-${Key}` }
  presets: Record<Preset, Record<Color, string>>
  byState: Record<State, { contrast: number; saturation: number }>
}

/** Compatibility input for the preset identifier accidentally published in 1.0.1. */
interface LegacyAppearanceConfiguration
  extends Omit<OrbVoiceAppearanceConfiguration, 'defaultPreset' | 'presetNames' | 'presets'> {
  defaultPreset: LegacyPresetNames[number]
  presetNames: LegacyPresetNames
  presets: Record<LegacyPresetNames[number], Record<Color, string>>
}

interface OrbVoiceRuntimeAppearanceConfiguration extends OrbVoiceAppearanceConfiguration {
  presets: OrbVoiceAppearanceConfiguration['presets'] & {
    /** @deprecated Use neongate; retained as a non-enumerable palette alias. */
    gojhonny: Record<Color, string>
  }
}

export interface OrbVoiceMotionConfigurationSource {
  animatedStyleProperties: readonly string[]
  easings: { easeInOut: string; easeOut: string; linear: string }
  full: Record<State, Record<Layer, OrbVoiceSerializedLayerMotion>>
  reduced: Record<State, Record<Layer, OrbVoiceSerializedLayerMotion>>
}

export interface OrbVoiceSpeechConfiguration {
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

export interface OrbVoiceRealtimeConfiguration {
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
export interface OrbVoiceConfigurationSource {
  component: OrbVoiceComponentConfiguration
  appearance: (
    | Omit<OrbVoiceAppearanceConfiguration, 'byState'>
    | Omit<LegacyAppearanceConfiguration, 'byState'>
  ) & {
    byState?: OrbVoiceAppearanceConfiguration['byState']
  }
  motion?: OrbVoiceMotionConfigurationSource
  speech?: OrbVoiceSpeechConfiguration
  realtime: OrbVoiceRealtimeConfiguration
}

/** Validated source after composing omitted internal defaults. */
export interface OrbVoiceResolvedConfigurationSource
  extends Omit<OrbVoiceConfigurationSource, 'appearance' | 'motion' | 'speech'> {
  appearance: OrbVoiceAppearanceConfiguration
  motion: OrbVoiceMotionConfigurationSource
  speech: OrbVoiceSpeechConfiguration
}

export interface OrbVoiceMotionConfiguration
  extends Omit<OrbVoiceMotionConfigurationSource, 'full' | 'reduced'> {
  full: Record<State, OrbVoiceMotionProfile>
  reduced: Record<State, OrbVoiceMotionProfile>
}

export interface OrbVoiceRuntimeConfiguration
  extends Omit<OrbVoiceResolvedConfigurationSource, 'appearance' | 'motion'> {
  appearance: OrbVoiceRuntimeAppearanceConfiguration
  motion: OrbVoiceMotionConfiguration
}

export type OrbVoiceConfiguration = OrbVoiceDeepReadonly<OrbVoiceRuntimeConfiguration>

/** The bundled defaults retain the same accurate configurable contracts. */
export type OrbVoiceBundledConfiguration = OrbVoiceConfiguration
