import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const external = ['fs', 'path', 'child_process', 'os', 'chalk'];

export default [
  // ES Module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    external,
    plugins: [
      nodeResolve(),
      terser()
    ]
  },
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    external,
    plugins: [
      nodeResolve(),
      terser()
    ]
  },
  // TypeScript definitions
  {
    input: 'src/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [dts()]
  }
];