import type { OrbVoiceTalkContext } from '@talk/talk.types'

export interface OrbVoiceIntelligencePort {
  respond(
    input: string,
    context: Readonly<OrbVoiceTalkContext>
  ): Promise<string>
}
