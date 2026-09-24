import type {
  OpenAISpeechFormat,
  OpenAISpeechModel,
  OpenAISpeechVoice,
  WebSpeechAdapterOptions
} from './talk.types'

export interface OrbVoiceWebSpeechVoiceModel extends WebSpeechAdapterOptions {
  provider: 'web-speech'
}

/** The endpoint belongs to the application and returns audio, never a provider key. */
export interface OrbVoiceOpenAISpeechVoiceModel {
  provider: 'openai-speech'
  endpoint: string | URL
  model?: OpenAISpeechModel
  voice?: OpenAISpeechVoice
  responseFormat?: OpenAISpeechFormat
  requestTimeoutMs?: number
}

export type OpenAIRealtimeModel = 'gpt-realtime-2' | (string & {})

export interface OrbVoiceOpenAIRealtimeVoiceModel {
  provider: 'openai-realtime'
  model?: OpenAIRealtimeModel
  voice?: string
  sessionTimeoutMs?: number
}

/** Public configuration only, never keys/tokens. Assignment is silent. */
export type OrbVoiceVoiceModel =
  | OrbVoiceWebSpeechVoiceModel
  | OrbVoiceOpenAISpeechVoiceModel
  | OrbVoiceOpenAIRealtimeVoiceModel

export interface OrbVoiceRealtimeSessionRequest {
  readonly sdp: string
  readonly model: string
  readonly voice: string
  readonly signal: AbortSignal
}

/** The application authorizes on its server and returns SDP, never a key or token. */
export type OrbVoiceRealtimeSessionAuthorizer = (request: OrbVoiceRealtimeSessionRequest) => Promise<string>

export interface OrbVoiceRealtimeSessionEndpoint {
  /** Public application URL; no embedded bearer tokens. POST returns SDP text. */
  endpoint: string | URL
  /** Fetch cookie policy only; never a credential value. */
  credentials?: RequestCredentials
  /** Consumer-owned transport; keep permanent provider keys on the server. */
  fetch?: typeof globalThis.fetch
}

/** Runtime authorization is deliberately separate from JSON/model selection. */
export type OrbVoiceRealtimeSession = OrbVoiceRealtimeSessionAuthorizer | OrbVoiceRealtimeSessionEndpoint

export interface OpenAIRealtimeAdapterOptions {
  session: OrbVoiceRealtimeSession
  model?: OpenAIRealtimeModel
  voice?: string
  sessionTimeoutMs?: number
}
