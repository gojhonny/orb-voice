import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

function resolveProjectPath(relativePath: string): string {
  return fileURLToPath(new URL(relativePath, import.meta.url))
}

export default defineConfig({
  resolve: {
    alias: {
      '@configuration': resolveProjectPath('./src/orb-voice.config.json'),
      '@core': resolveProjectPath('./src/core'),
      '@element': resolveProjectPath('./src/element'),
      '@factories': resolveProjectPath('./src/factories'),
      '@orb-voice': resolveProjectPath('./src/index.ts'),
      '@ports': resolveProjectPath('./src/ports'),
      '@services': resolveProjectPath('./src/services'),
      '@talk': resolveProjectPath('./src/talk'),
      'virtual:orb-voice-styles': resolveProjectPath('./test/fixtures/orb-voice-styles.ts')
    }
  },
  test: {
    clearMocks: true,
    coverage: {
      exclude: [
        'src/**/*.test.ts',
        'src/browser.client.ts',
        'src/core/styles.types.d.ts',
        'src/react.types.ts'
      ],
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html']
    },
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
    setupFiles: ['./test/setup.ts']
  }
})
