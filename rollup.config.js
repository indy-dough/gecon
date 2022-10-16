import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      sourcemap: true,
      file: 'dist/index.esm.js',
      format: 'es',
    },
    {
      sourcemap: true,
      file: 'dist/index.esm.min.js',
      format: 'es',
      plugins: [terser()],
    },
    {
      sourcemap: true,
      file: 'dist/index.js',
      format: 'cjs',
    },
    {
      sourcemap: true,
      file: 'dist/index.min.js',
      format: 'cjs',
      plugins: [terser()],
    },
  ],
  plugins: [resolve(), babel({ babelHelpers: 'bundled' }), typescript()],
};
