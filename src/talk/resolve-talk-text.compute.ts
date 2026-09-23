import { orbvConfiguration } from '@core/config.data'
import type { OrbVTalkContext } from '@talk/talk.types'

const talkTokenPattern = new RegExp(
  orbvConfiguration.speech.tokenPattern.source,
  orbvConfiguration.speech.tokenPattern.flags
)

export function resolveTalkText(
  text: string,
  context: Readonly<OrbVTalkContext>
): string {
  return text.replace(talkTokenPattern, (_token, key: string) => {
    return context[key] ?? ''
  })
}
