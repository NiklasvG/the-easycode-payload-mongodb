import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
const babel = require('next/dist/compiled/babel/core')
const compiler = require('babel-plugin-react-compiler')
const virtualID = '\0virtual:compiled-masonry-grid.tsx'
export default defineConfig({
  plugins: [{
    name: 'compiler-evaluation',
    enforce: 'pre',
    resolveId(id) { return id === 'virtual:compiled-masonry-grid' ? virtualID : null },
    load(id) {
      if (id !== virtualID) return null
      const filename = 'src/components/layout/MasonryGrid.tsx'
      const source = readFileSync(filename, 'utf8').replace('  const [selectedProjectType', "  'use memo'\n  const [selectedProjectType")
      return babel.transformSync(source, { filename, configFile: false, babelrc: false, parserOpts: { plugins: ['typescript', 'jsx'] }, plugins: [[compiler, { compilationMode: 'annotation', target: '19' }]], presets: [[require('next/dist/compiled/babel/preset-typescript'), { allExtensions: true, isTSX: true }], [require('next/dist/compiled/babel/preset-react'), { runtime: 'automatic' }]] }).code
    },
  }, ...react()],
  resolve: { tsconfigPaths: true },
  test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], include: ['experiments/compiler/profile.spec.ts'] },
})
