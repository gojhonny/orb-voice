import type { OrbVTalkContext } from '@talk/talk.types'

export interface OrbVIntelligencePort {
  respond(
    input: string,
    context: Readonly<OrbVTalkContext>
  ): Promise<string>
}
