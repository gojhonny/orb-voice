import type {
  OrbuPresetName,
  OrbuReducedMotion,
  OrbuSize,
  OrbuState
} from '@core/appearance/appearance.types'
import type { OrbuIntelligencePort } from '@ports/intelligence.port'
import type { OrbuConversationState } from '@ports/conversation.port'
import type { OrbuVoiceEnginePort } from '@ports/voice-engine.port'
import type { OrbuTalkContext, OrbuTalkStep } from '@talk/talk.types'
import type { OrbuRealtimeSession, OrbuVoiceModel } from '@talk/voice-model.types'

export interface OrbuAnimationLayers {
  aura: HTMLElement
  core: HTMLElement
  field: HTMLElement
  highlight: HTMLElement
  ring: HTMLElement
  root: HTMLElement
}

export interface OrbuAnimationSettings {
  paused: boolean
  reduced: boolean
  speed: number
  state: OrbuState
}

export interface OrbuShadowTree {
  layers: OrbuAnimationLayers
  root: HTMLElement
}

export interface OrbuVoiceOptions {
  intelligence?: OrbuIntelligencePort
  talkFlow?: readonly OrbuTalkStep[]
  speech?: string
  voiceEngine?: OrbuVoiceEnginePort
  voiceModel?: OrbuVoiceModel
  realtimeSession?: OrbuRealtimeSession
}

export interface OrbuElement extends HTMLElement {
  readonly conversationState: OrbuConversationState
  elevated: boolean
  intelligence: OrbuIntelligencePort | undefined
  paused: boolean
  get preset(): OrbuPresetName
  set preset(value: OrbuPresetName | null | undefined)
  reducedMotion: OrbuReducedMotion
  size: OrbuSize
  get speech(): string | undefined
  set speech(value: string | null | undefined)
  speed: number
  state: OrbuState
  readonly talkContext: Readonly<OrbuTalkContext>
  get talkFlow(): readonly OrbuTalkStep[]
  set talkFlow(value: readonly OrbuTalkStep[] | undefined)
  get voiceEngine(): OrbuVoiceEnginePort | undefined
  set voiceEngine(value: OrbuVoiceEnginePort | undefined)
  /** Public model options only; this property is not reflected into attributes. */
  get voiceModel(): Readonly<OrbuVoiceModel> | undefined
  set voiceModel(value: OrbuVoiceModel | null | undefined)
  /** Application authorization boundary; never pass provider keys or tokens. */
  get realtimeSession(): OrbuRealtimeSession | undefined
  set realtimeSession(value: OrbuRealtimeSession | undefined)
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

export type OrbuElementConstructor = CustomElementConstructor & {
  new (): OrbuElement
  readonly observedAttributes: readonly string[]
  readonly prototype: OrbuElement
}
