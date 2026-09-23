import { readFile } from 'node:fs/promises'

const ORBV_STYLES_ID = 'virtual:orbv-styles'
const RESOLVED_ORBV_STYLES_ID = `\0${ORBV_STYLES_ID}`
const ORBV_STYLES_URL = new URL('./src/element/index.css', import.meta.url)

export function orbvCssPlugin() {
  return {
    name: 'orbv-css',
    resolveId(id: string): string | undefined {
      return id === ORBV_STYLES_ID ? RESOLVED_ORBV_STYLES_ID : undefined
    },
    async load(id: string): Promise<string | undefined> {
      if (id !== RESOLVED_ORBV_STYLES_ID) {
        return undefined
      }

      const styles = await readFile(ORBV_STYLES_URL, 'utf8')

      return `export default ${JSON.stringify(styles)}`
    }
  }
}
