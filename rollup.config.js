import buble from 'rollup-plugin-buble';
import { terser } from "rollup-plugin-terser";
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace'

const env = process.env.NODE_ENV;

const conf = {
  input: "src/index.js",
  output: {
    file: env === "production" ? "lib/index.js" : "example/index.js",
    format: "es",
  },
  plugins: [
    resolve(),
    buble({ objectAssign: true, transforms: { generator: false } }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    commonjs(),
    env === "production" && terser(),
  ],
};

export default conf;