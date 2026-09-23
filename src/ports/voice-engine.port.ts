export interface OrbVVoiceEnginePort {
  speak(text: string): Promise<void>
  stop(): void
}
