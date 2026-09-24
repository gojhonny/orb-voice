export interface OrboVoiceEnginePort {
  speak(text: string): Promise<void>
  stop(): void
}
