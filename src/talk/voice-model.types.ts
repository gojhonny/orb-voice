import type {
  OpenAISpeechFormat,
  OpenAISpeechModel,
  OpenAISpeechVoice,
  WebSpeechAdapterOptions
} from './talk.types'

export interface OrbuWebSpeechVoiceModel extends WebSpeechAdapterOptions {
  provider: 'web-speech'
}

/** The endpoint belongs to the application and returns audio, never a provider key. */
export interface OrbuOpenAISpeechVoiceModel {
  provider: 'openai-speech'
  endpoint: string | URL
  model?: OpenAISpeechModel
  voice?: OpenAISpeechVoice
  responseFormat?: OpenAISpeechFormat
  requestTimeoutMs?: number
}

export type OpenAIRealtimeModel = 'gpt-realtime-2' | (string & {})

export interface OrbuOpenAIRealtimeVoiceModel {
  provider: 'openai-realtime'
  model?: OpenAIRealtimeModel
  voice?: string
  sessionTimeoutMs?: number
}

/** Public configuration only, never keys/tokens. Assignment is silent. */
export type OrbuVoiceModel =
  | OrbuWebSpeechVoiceModel
  | OrbuOpenAISpeechVoiceModel
  | OrbuOpenAIRealtimeVoiceModel

export interface OrbuRealtimeSessionRequest {
  readonly sdp: string
  readonly model: string
  readonly voice: string
  readonly signal: AbortSignal
}

/** The application authorizes on its server and returns SDP, never a key or token. */
export type OrbuRealtimeSessionAuthorizer = (request: OrbuRealtimeSessionRequest) => Promise<string>

export interface OrbuRealtimeSessionEndpoint {
  /** Public application URL; no embedded bearer tokens. POST returns SDP text. */
  endpoint: string | URL
  /** Fetch cookie policy only; never a credential value. */
  credentials?: RequestCredentials
  /** Consumer-owned transport; keep permanent provider keys on the server. */
  fetch?: typeof globalThis.fetch
}

/** Runtime authorization is deliberately separate from JSON/model selection. */
export type OrbuRealtimeSession = OrbuRealtimeSessionAuthorizer | OrbuRealtimeSessionEndpoint

export interface OpenAIRealtimeAdapterOptions {
  session: OrbuRealtimeSession
  model?: OpenAIRealtimeModel
  voice?: string
  sessionTimeoutMs?: number
}
