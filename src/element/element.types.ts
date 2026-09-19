import type {
  OrbVPresetName,
  OrbVReducedMotion,
  OrbVSize,
  OrbVState
} from '@core/appearance/appearance.types'
import type { OrbVIntelligencePort } from '@ports/intelligence.port'
import type { OrbVConversationState } from '@ports/conversation.port'
import type { OrbVVoiceEnginePort } from '@ports/voice-engine.port'
import type { OrbVTalkContext, OrbVTalkStep } from '@talk/talk.types'
import type { OrbVRealtimeSession, OrbVVoiceModel } from '@talk/voice-model.types'

export interface OrbVAnimationLayers {
  aura: HTMLElement
  core: HTMLElement
  field: HTMLElement
  highlight: HTMLElement
  ring: HTMLElement
  root: HTMLElement
}

export interface OrbVAnimationSettings {
  paused: boolean
  reduced: boolean
  speed: number
  state: OrbVState
}

export interface OrbVShadowTree {
  layers: OrbVAnimationLayers
  root: HTMLElement
}

export interface OrbVVoiceOptions {
  intelligence?: OrbVIntelligencePort
  talkFlow?: readonly OrbVTalkStep[]
  speech?: string
  voiceEngine?: OrbVVoiceEnginePort
  voiceModel?: OrbVVoiceModel
  realtimeSession?: OrbVRealtimeSession
}

export interface OrbVElement extends HTMLElement {
  readonly conversationState: OrbVConversationState
  elevated: boolean
  intelligence: OrbVIntelligencePort | undefined
  paused: boolean
  get preset(): OrbVPresetName
  set preset(value: OrbVPresetName | null | undefined)
  reducedMotion: OrbVReducedMotion
  size: OrbVSize
  get speech(): string | undefined
  set speech(value: string | null | undefined)
  speed: number
  state: OrbVState
  readonly talkContext: Readonly<OrbVTalkContext>
  get talkFlow(): readonly OrbVTalkStep[]
  set talkFlow(value: readonly OrbVTalkStep[] | undefined)
  get voiceEngine(): OrbVVoiceEnginePort | undefined
  set voiceEngine(value: OrbVVoiceEnginePort | undefined)
  /** Public model options only; this property is not reflected into attributes. */
  get voiceModel(): Readonly<OrbVVoiceModel> | undefined
  set voiceModel(value: OrbVVoiceModel | null | undefined)
  /** Application authorization boundary; never pass provider keys or tokens. */
  get realtimeSession(): OrbVRealtimeSession | undefined
  set realtimeSession(value: OrbVRealtimeSession | undefined)
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

export type OrbVElementConstructor = CustomElementConstructor & {
  new (): OrbVElement
  readonly observedAttributes: readonly string[]
  readonly prototype: OrbVElement
}
