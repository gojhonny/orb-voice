export type OrbVConversationState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error'

/** Text alternatives only; never raw provider events, SDP, or credentials. */
export interface OrbVTranscript {
  readonly role: 'user' | 'assistant'
  readonly text: string
  readonly final: boolean
  readonly itemId?: string
}

export interface OrbVConversationHandlers {
  onStateChange(state: OrbVConversationState): void
  onTranscript(transcript: OrbVTranscript): void
  onError(error: Error): void
}

/** A live audio session, separate from the speak(text) output-only port. */
export interface OrbVConversationPort {
  start(handlers: OrbVConversationHandlers): Promise<void>
  stop(): void
  interrupt(): void
}
