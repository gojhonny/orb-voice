import type {
  OrbVoicePresetName,
  OrbVoiceReducedMotion,
  OrbVoiceSize,
  OrbVoiceState
} from '@core/appearance/appearance.types'
import type { OrbVoiceIntelligencePort } from '@ports/intelligence.port'
import type { OrbVoiceConversationState } from '@ports/conversation.port'
import type { OrbVoiceVoiceEnginePort } from '@ports/voice-engine.port'
import type { OrbVoiceTalkContext, OrbVoiceTalkStep } from '@talk/talk.types'
import type { OrbVoiceRealtimeSession, OrbVoiceVoiceModel } from '@talk/voice-model.types'

export interface OrbVoiceAnimationLayers {
  aura: HTMLElement
  core: HTMLElement
  field: HTMLElement
  highlight: HTMLElement
  ring: HTMLElement
  root: HTMLElement
}

export interface OrbVoiceAnimationSettings {
  paused: boolean
  reduced: boolean
  speed: number
  state: OrbVoiceState
}

export interface OrbVoiceShadowTree {
  layers: OrbVoiceAnimationLayers
  root: HTMLElement
}

export interface OrbVoiceVoiceOptions {
  intelligence?: OrbVoiceIntelligencePort
  talkFlow?: readonly OrbVoiceTalkStep[]
  speech?: string
  voiceEngine?: OrbVoiceVoiceEnginePort
  voiceModel?: OrbVoiceVoiceModel
  realtimeSession?: OrbVoiceRealtimeSession
}

export interface OrbVoiceElement extends HTMLElement {
  readonly conversationState: OrbVoiceConversationState
  elevated: boolean
  intelligence: OrbVoiceIntelligencePort | undefined
  paused: boolean
  get preset(): OrbVoicePresetName
  set preset(value: OrbVoicePresetName | null | undefined)
  reducedMotion: OrbVoiceReducedMotion
  size: OrbVoiceSize
  get speech(): string | undefined
  set speech(value: string | null | undefined)
  speed: number
  state: OrbVoiceState
  readonly talkContext: Readonly<OrbVoiceTalkContext>
  get talkFlow(): readonly OrbVoiceTalkStep[]
  set talkFlow(value: readonly OrbVoiceTalkStep[] | undefined)
  get voiceEngine(): OrbVoiceVoiceEnginePort | undefined
  set voiceEngine(value: OrbVoiceVoiceEnginePort | undefined)
  /** Public model options only; this property is not reflected into attributes. */
  get voiceModel(): Readonly<OrbVoiceVoiceModel> | undefined
  set voiceModel(value: OrbVoiceVoiceModel | null | undefined)
  /** Application authorization boundary; never pass provider keys or tokens. */
  get realtimeSession(): OrbVoiceRealtimeSession | undefined
  set realtimeSession(value: OrbVoiceRealtimeSession | undefined)
  pause(): void
  play(): void
  receive(input: string): Promise<void>
  restart(): void
  startTalking(): Promise<void>
  stopTalking(): void
  startConversation(): Promise<void>
  stopConversation(): void
  interruptConversation(): void
}

export type OrbVoiceElementConstructor = CustomElementConstructor & {
  new (): OrbVoiceElement
  readonly observedAttributes: readonly string[]
  readonly prototype: OrbVoiceElement
}
