import path from 'path'
import tsPlugin from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve';

const resolve = p => path.resolve(__dirname, p)

const formats = ['esm', 'esm-browser', 'global']

const extensions = [
  '.js',
  '.ts',
]

const baseConfig = {
  input: resolve('./src/index.ts'),
  plugins: [
    nodeResolve({
      extensions
    }),
    tsPlugin({
      check: true,
      tsconfig: resolve('tsconfig.json'),
      tsconfigOverride: {
        compilerOptions: {
          declaration: true
        }
      }
    }),
  ],
  treeshake: {
    moduleSideEffects: false
  },
}

const outputConfig = {
  'esm': {
    file: resolve(`dist/caught-esm.js`),
    format: `es`
  },
  'esm-browser': {
    file: resolve(`dist/caught-esm-browser.js`),
    format: `es`
  },
  'global': {
    file: resolve(`dist/caught-global.js`),
    format: `iife`,
    name: 'createCaught',
  },
}

const bundlingConfigArr = 
formats.map(format => {
  const output = outputConfig[format]
  const plugins = []
  const isForScriptUse = format === 'global' || format === 'esm-browser'
  if (isForScriptUse) {
    const replacePlugin = require('@rollup/plugin-replace')
    const { terser } = require('rollup-plugin-terser')
    plugins.push(
      replacePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2015,
          pure_getters: true
        },
        safari10: true
      })
    )
  }
  return {
    ...baseConfig,
    input: isForScriptUse ? resolve('./src/index.global.ts') : baseConfig.input,
    output,
    plugins: [ ...baseConfig.plugins, ...plugins ]
  }
})

export default bundlingConfigArr
