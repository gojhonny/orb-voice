export interface OrbVoiceVoiceEnginePort {
  speak(text: string): Promise<void>
  stop(): void
}
