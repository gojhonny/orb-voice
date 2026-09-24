import type { OrboTalkContext } from '@talk/talk.types'

export interface OrboIntelligencePort {
  respond(
    input: string,
    context: Readonly<OrboTalkContext>
  ): Promise<string>
}
