import { defineConfig } from 'tsdown'

import { orboCssPlugin } from './tsdown.css.config.ts'

export default defineConfig({
  clean: true,
  copy: {
    from: 'src/element/index.css',
    rename: 'index.css',
    to: 'dist'
  },
  dts: {
    sourcemap: false
  },
  deps: {
    neverBundle: ['react']
  },
  entry: {
    browser: 'src/browser.client.ts',
    'orbo': 'src/index.ts',
    'react-types': 'src/react.types.ts'
  },
  failOnWarn: true,
  fixedExtension: false,
  format: ['esm'],
  hash: false,
  minify: false,
  platform: 'neutral',
  plugins: [orboCssPlugin()],
  sourcemap: false,
  target: 'es2022'
})
