import type { OrbuTalkContext } from '@talk/talk.types'

export interface OrbuIntelligencePort {
  respond(
    input: string,
    context: Readonly<OrbuTalkContext>
  ): Promise<string>
}
