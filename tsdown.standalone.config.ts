import { defineConfig } from 'tsdown'

import { orboCssPlugin } from './tsdown.css.config.ts'

export default defineConfig({
  clean: false,
  dts: false,
  entry: {
    'standalone/orbo': 'src/browser.client.ts'
  },
  failOnWarn: true,
  fixedExtension: false,
  format: ['esm'],
  hash: false,
  minify: true,
  platform: 'browser',
  plugins: [orboCssPlugin()],
  sourcemap: false,
  target: 'es2022'
})
