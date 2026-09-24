import { orboConfiguration } from '@core/config.data'
import type { OrboTalkContext } from '@talk/talk.types'

const talkTokenPattern = new RegExp(
  orboConfiguration.speech.tokenPattern.source,
  orboConfiguration.speech.tokenPattern.flags
)

export function resolveTalkText(
  text: string,
  context: Readonly<OrboTalkContext>
): string {
  return text.replace(talkTokenPattern, (_token, key: string) => {
    return context[key] ?? ''
  })
}
