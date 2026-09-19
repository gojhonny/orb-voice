import type {
  OrbVAnimationValues,
  OrbVMotionProfile,
  OrbVTransition
} from '@core/motion/motion.types'

export type OrbVStates = readonly ['idle', 'listening', 'thinking', 'speaking', 'asleep']
export type OrbVReducedMotionModes = readonly ['system', 'always', 'never']
export type OrbVPresetNames = readonly [
  'neongate',
  'periwinkle',
  'magenta',
  'peach',
  'mocha',
  'ivory'
]
/** @deprecated Use the canonical NeonGate identifier in new configuration. */
type LegacyPresetNames = readonly ['gojhonny', ...OmitFirst<OrbVPresetNames>]
type OmitFirst<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest]
  ? Rest
  : never
export type OrbVColorKeys = readonly ['accent', 'background', 'highlight', 'primary', 'secondary']

type State = OrbVStates[number]
type Preset = OrbVPresetNames[number]
type Color = OrbVColorKeys[number]
type Layer = 'aura' | 'core' | 'field' | 'highlight' | 'ring' | 'root'

export type OrbVDeepReadonly<T> = T extends object
  ? { readonly [Key in keyof T]: OrbVDeepReadonly<T[Key]> }
  : T

export interface OrbVSerializedLayerMotion {
  animate: OrbVAnimationValues
  transition: Omit<OrbVTransition, 'repeat'> & { repeat?: number | 'infinite' }
}

export interface OrbVComponentConfiguration {
  tagName: 'orb-v'
  states: OrbVStates
  reducedMotionModes: OrbVReducedMotionModes
  defaultState: State
  defaultSize: string
  defaultSpeed: number
  defaultReducedMotion: OrbVReducedMotionModes[number]
  /** Base attributes in source JSON; includes derived color attributes at runtime. */
  observedAttributes: readonly string[]
}

export interface OrbVAppearanceConfiguration {
  defaultPreset: Preset
  presetNames: OrbVPresetNames
  colorKeys: OrbVColorKeys
  colorAttributes: { [Key in Color]: `color-${Key}` }
  presets: Record<Preset, Record<Color, string>>
  byState: Record<State, { contrast: number; saturation: number }>
}

/** Compatibility input for the preset identifier accidentally published in 1.0.1. */
interface LegacyAppearanceConfiguration
  extends Omit<OrbVAppearanceConfiguration, 'defaultPreset' | 'presetNames' | 'presets'> {
  defaultPreset: LegacyPresetNames[number]
  presetNames: LegacyPresetNames
  presets: Record<LegacyPresetNames[number], Record<Color, string>>
}

interface OrbVRuntimeAppearanceConfiguration extends OrbVAppearanceConfiguration {
  presets: OrbVAppearanceConfiguration['presets'] & {
    /** @deprecated Use neongate; retained as a non-enumerable palette alias. */
    gojhonny: Record<Color, string>
  }
}

export interface OrbVMotionConfigurationSource {
  animatedStyleProperties: readonly string[]
  easings: { easeInOut: string; easeOut: string; linear: string }
  full: Record<State, Record<Layer, OrbVSerializedLayerMotion>>
  reduced: Record<State, Record<Layer, OrbVSerializedLayerMotion>>
}

export interface OrbVSpeechConfiguration {
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

export interface OrbVRealtimeConfiguration {
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
export interface OrbVConfigurationSource {
  component: OrbVComponentConfiguration
  appearance: (
    | Omit<OrbVAppearanceConfiguration, 'byState'>
    | Omit<LegacyAppearanceConfiguration, 'byState'>
  ) & {
    byState?: OrbVAppearanceConfiguration['byState']
  }
  motion?: OrbVMotionConfigurationSource
  speech?: OrbVSpeechConfiguration
  realtime: OrbVRealtimeConfiguration
}

/** Validated source after composing omitted internal defaults. */
export interface OrbVResolvedConfigurationSource
  extends Omit<OrbVConfigurationSource, 'appearance' | 'motion' | 'speech'> {
  appearance: OrbVAppearanceConfiguration
  motion: OrbVMotionConfigurationSource
  speech: OrbVSpeechConfiguration
}

export interface OrbVMotionConfiguration
  extends Omit<OrbVMotionConfigurationSource, 'full' | 'reduced'> {
  full: Record<State, OrbVMotionProfile>
  reduced: Record<State, OrbVMotionProfile>
}

export interface OrbVRuntimeConfiguration
  extends Omit<OrbVResolvedConfigurationSource, 'appearance' | 'motion'> {
  appearance: OrbVRuntimeAppearanceConfiguration
  motion: OrbVMotionConfiguration
}

export type OrbVConfiguration = OrbVDeepReadonly<OrbVRuntimeConfiguration>

/** The bundled defaults retain the same accurate configurable contracts. */
export type OrbVBundledConfiguration = OrbVConfiguration
