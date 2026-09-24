export interface OrbVoiceTalkContext {
  fullName?: string
  [key: string]: string | undefined
}

export type OrbVoiceTalkStep =
  | {
      id: string
      kind: 'say'
      needsAuth: boolean
      text: string
    }
  | {
      capture: string
      id: string
      kind: 'ask'
      needsAuth: boolean
      text: string
    }
  | {
      fallback: string
      id: string
      kind: 'respond'
      needsAuth: boolean
      strategy: 'openai'
    }

export interface WebSpeechAdapterOptions {
  language?: string
  pitch?: number
  preferredVoices?: readonly string[]
  rate?: number
  voiceLoadTimeoutMs?: number
  volume?: number
}

export type OpenAISpeechModel = 'gpt-4o-mini-tts' | 'tts-1' | 'tts-1-hd' | (string & {})

export type OpenAISpeechVoice =
  | 'alloy'
  | 'ash'
  | 'ballad'
  | 'cedar'
  | 'coral'
  | 'echo'
  | 'fable'
  | 'marin'
  | 'nova'
  | 'onyx'
  | 'sage'
  | 'shimmer'
  | 'verse'
  | (string & {})

export type OpenAISpeechFormat = 'aac' | 'flac' | 'mp3' | 'opus' | 'wav'

export interface OpenAISpeechAdapterOptions {
  credentials?: RequestCredentials
  endpoint: string | URL
  fetch?: typeof globalThis.fetch
  /** Application endpoint headers only; never permanent provider API keys. */
  headers?: Readonly<Record<string, string>>
  instructions?: string
  model?: OpenAISpeechModel
  responseFormat?: OpenAISpeechFormat
  requestTimeoutMs?: number
  voice?: OpenAISpeechVoice
}
