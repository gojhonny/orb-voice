export type OrbuConversationState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error'

/** Text alternatives only; never raw provider events, SDP, or credentials. */
export interface OrbuTranscript {
  readonly role: 'user' | 'assistant'
  readonly text: string
  readonly final: boolean
  readonly itemId?: string
}

export interface OrbuConversationHandlers {
  onStateChange(state: OrbuConversationState): void
  onTranscript(transcript: OrbuTranscript): void
  onError(error: Error): void
}

/** A live audio session, separate from the speak(text) output-only port. */
export interface OrbuConversationPort {
  start(handlers: OrbuConversationHandlers): Promise<void>
  stop(): void
  interrupt(): void
}
