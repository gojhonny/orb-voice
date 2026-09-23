export type OrbVoiceConversationState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error'

/** Text alternatives only; never raw provider events, SDP, or credentials. */
export interface OrbVoiceTranscript {
  readonly role: 'user' | 'assistant'
  readonly text: string
  readonly final: boolean
  readonly itemId?: string
}

export interface OrbVoiceConversationHandlers {
  onStateChange(state: OrbVoiceConversationState): void
  onTranscript(transcript: OrbVoiceTranscript): void
  onError(error: Error): void
}

/** A live audio session, separate from the speak(text) output-only port. */
export interface OrbVoiceConversationPort {
  start(handlers: OrbVoiceConversationHandlers): Promise<void>
  stop(): void
  interrupt(): void
}
