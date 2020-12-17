import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'index.js',
    output: {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      name: 'gecon'
    },
    plugins: [
    ],
  },
  {
    input: 'index.js',
    output: {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      name: 'gecon'
    },
    plugins: [
      babel(),
      terser()
    ],
  }
];
