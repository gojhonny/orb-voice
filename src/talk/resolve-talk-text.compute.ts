import { orbVoiceConfiguration } from '@core/config.data'
import type { OrbVoiceTalkContext } from '@talk/talk.types'

const talkTokenPattern = new RegExp(
  orbVoiceConfiguration.speech.tokenPattern.source,
  orbVoiceConfiguration.speech.tokenPattern.flags
)

export function resolveTalkText(
  text: string,
  context: Readonly<OrbVoiceTalkContext>
): string {
  return text.replace(talkTokenPattern, (_token, key: string) => {
    return context[key] ?? ''
  })
}
