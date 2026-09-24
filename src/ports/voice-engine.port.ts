export interface OrbuVoiceEnginePort {
  speak(text: string): Promise<void>
  stop(): void
}
