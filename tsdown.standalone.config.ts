import { defineConfig } from 'tsdown'

import { orbvCssPlugin } from './tsdown.css.config.ts'

export default defineConfig({
  clean: false,
  dts: false,
  entry: {
    'standalone/orbv': 'src/browser.client.ts'
  },
  failOnWarn: true,
  fixedExtension: false,
  format: ['esm'],
  hash: false,
  minify: true,
  platform: 'browser',
  plugins: [orbvCssPlugin()],
  sourcemap: false,
  target: 'es2022'
})
