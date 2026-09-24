import { readFile } from 'node:fs/promises'

const ORBU_STYLES_ID = 'virtual:orbu-styles'
const RESOLVED_ORBU_STYLES_ID = `\0${ORBU_STYLES_ID}`
const ORBU_STYLES_URL = new URL('./src/element/index.css', import.meta.url)

export function orbuCssPlugin() {
  return {
    name: 'orbu-css',
    resolveId(id: string): string | undefined {
      return id === ORBU_STYLES_ID ? RESOLVED_ORBU_STYLES_ID : undefined
    },
    async load(id: string): Promise<string | undefined> {
      if (id !== RESOLVED_ORBU_STYLES_ID) {
        return undefined
      }

      const styles = await readFile(ORBU_STYLES_URL, 'utf8')

      return `export default ${JSON.stringify(styles)}`
    }
  }
}
