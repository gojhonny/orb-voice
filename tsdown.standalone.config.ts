import { defineConfig } from 'tsdown'

import { orbuCssPlugin } from './tsdown.css.config.ts'

export default defineConfig({
  clean: false,
  dts: false,
  entry: {
    'standalone/orbu': 'src/browser.client.ts'
  },
  failOnWarn: true,
  fixedExtension: false,
  format: ['esm'],
  hash: false,
  minify: true,
  platform: 'browser',
  plugins: [orbuCssPlugin()],
  sourcemap: false,
  target: 'es2022'
})
