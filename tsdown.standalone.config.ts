import { defineConfig } from 'tsdown'

import { orbVoiceCssPlugin } from './tsdown.css.config.ts'

export default defineConfig({
  clean: false,
  dts: false,
  entry: {
    'standalone/orb-voice': 'src/browser.client.ts'
  },
  failOnWarn: true,
  fixedExtension: false,
  format: ['esm'],
  hash: false,
  minify: true,
  platform: 'browser',
  plugins: [orbVoiceCssPlugin()],
  sourcemap: false,
  target: 'es2022'
})
