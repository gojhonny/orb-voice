import { readFile } from 'node:fs/promises'

const ORB_VOICE_STYLES_ID = 'virtual:orb-voice-styles'
const RESOLVED_ORB_VOICE_STYLES_ID = `\0${ORB_VOICE_STYLES_ID}`
const ORB_VOICE_STYLES_URL = new URL('./src/element/index.css', import.meta.url)

export function orbVoiceCssPlugin() {
  return {
    name: 'orb-voice-css',
    resolveId(id: string): string | undefined {
      return id === ORB_VOICE_STYLES_ID ? RESOLVED_ORB_VOICE_STYLES_ID : undefined
    },
    async load(id: string): Promise<string | undefined> {
      if (id !== RESOLVED_ORB_VOICE_STYLES_ID) {
        return undefined
      }

      const styles = await readFile(ORB_VOICE_STYLES_URL, 'utf8')

      return `export default ${JSON.stringify(styles)}`
    }
  }
}
