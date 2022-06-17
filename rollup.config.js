import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'es',
    },
    {
      file: 'dist/index.esm.min.js',
      format: 'es',
      plugins: [terser()],
    },
    {
      file: 'dist/index.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.min.js',
      format: 'cjs',
      plugins: [terser()],
    },
  ],
  plugins: [resolve(), babel({ babelHelpers: 'bundled' })]
};
