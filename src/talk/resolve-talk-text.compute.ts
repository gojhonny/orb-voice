import { orbuConfiguration } from '@core/config.data'
import type { OrbuTalkContext } from '@talk/talk.types'

const talkTokenPattern = new RegExp(
  orbuConfiguration.speech.tokenPattern.source,
  orbuConfiguration.speech.tokenPattern.flags
)

export function resolveTalkText(
  text: string,
  context: Readonly<OrbuTalkContext>
): string {
  return text.replace(talkTokenPattern, (_token, key: string) => {
    return context[key] ?? ''
  })
}
