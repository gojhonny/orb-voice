export type OrboConversationState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error'

/** Text alternatives only; never raw provider events, SDP, or credentials. */
export interface OrboTranscript {
  readonly role: 'user' | 'assistant'
  readonly text: string
  readonly final: boolean
  readonly itemId?: string
}

export interface OrboConversationHandlers {
  onStateChange(state: OrboConversationState): void
  onTranscript(transcript: OrboTranscript): void
  onError(error: Error): void
}

/** A live audio session, separate from the speak(text) output-only port. */
export interface OrboConversationPort {
  start(handlers: OrboConversationHandlers): Promise<void>
  stop(): void
  interrupt(): void
}
