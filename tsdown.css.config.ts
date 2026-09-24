import { readFile } from 'node:fs/promises'

const ORBO_STYLES_ID = 'virtual:orbo-styles'
const RESOLVED_ORBO_STYLES_ID = `\0${ORBO_STYLES_ID}`
const ORBO_STYLES_URL = new URL('./src/element/index.css', import.meta.url)

export function orboCssPlugin() {
  return {
    name: 'orbo-css',
    resolveId(id: string): string | undefined {
      return id === ORBO_STYLES_ID ? RESOLVED_ORBO_STYLES_ID : undefined
    },
    async load(id: string): Promise<string | undefined> {
      if (id !== RESOLVED_ORBO_STYLES_ID) {
        return undefined
      }

      const styles = await readFile(ORBO_STYLES_URL, 'utf8')

      return `export default ${JSON.stringify(styles)}`
    }
  }
}
