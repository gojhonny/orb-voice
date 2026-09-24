import type {
  OrboPresetName,
  OrboReducedMotion,
  OrboSize,
  OrboState
} from '@core/appearance/appearance.types'
import type { OrboIntelligencePort } from '@ports/intelligence.port'
import type { OrboConversationState } from '@ports/conversation.port'
import type { OrboVoiceEnginePort } from '@ports/voice-engine.port'
import type { OrboTalkContext, OrboTalkStep } from '@talk/talk.types'
import type { OrboRealtimeSession, OrboVoiceModel } from '@talk/voice-model.types'

export interface OrboAnimationLayers {
  aura: HTMLElement
  core: HTMLElement
  field: HTMLElement
  highlight: HTMLElement
  ring: HTMLElement
  root: HTMLElement
}

export interface OrboAnimationSettings {
  paused: boolean
  reduced: boolean
  speed: number
  state: OrboState
}

export interface OrboShadowTree {
  layers: OrboAnimationLayers
  root: HTMLElement
}

export interface OrboVoiceOptions {
  intelligence?: OrboIntelligencePort
  talkFlow?: readonly OrboTalkStep[]
  speech?: string
  voiceEngine?: OrboVoiceEnginePort
  voiceModel?: OrboVoiceModel
  realtimeSession?: OrboRealtimeSession
}

export interface OrboElement extends HTMLElement {
  readonly conversationState: OrboConversationState
  elevated: boolean
  intelligence: OrboIntelligencePort | undefined
  paused: boolean
  get preset(): OrboPresetName
  set preset(value: OrboPresetName | null | undefined)
  reducedMotion: OrboReducedMotion
  size: OrboSize
  get speech(): string | undefined
  set speech(value: string | null | undefined)
  speed: number
  state: OrboState
  readonly talkContext: Readonly<OrboTalkContext>
  get talkFlow(): readonly OrboTalkStep[]
  set talkFlow(value: readonly OrboTalkStep[] | undefined)
  get voiceEngine(): OrboVoiceEnginePort | undefined
  set voiceEngine(value: OrboVoiceEnginePort | undefined)
  /** Public model options only; this property is not reflected into attributes. */
  get voiceModel(): Readonly<OrboVoiceModel> | undefined
  set voiceModel(value: OrboVoiceModel | null | undefined)
  /** Application authorization boundary; never pass provider keys or tokens. */
  get realtimeSession(): OrboRealtimeSession | undefined
  set realtimeSession(value: OrboRealtimeSession | undefined)
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

export type OrboElementConstructor = CustomElementConstructor & {
  new (): OrboElement
  readonly observedAttributes: readonly string[]
  readonly prototype: OrboElement
}
