// test/rollup.config.js - @tccl/graph-layer-components

import { nodeResolve } from "@rollup/plugin-node-resolve";
import vue from "rollup-plugin-vue";
import css from "rollup-plugin-css-only";
import svg from "rollup-plugin-svg";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";

const plugins = [
  nodeResolve(),
  vue({
    css: false,
    style: {
      postcssModulesOptions: {
        generateScopedName: '[local]-[hash:base64:4]'
      }
    }
  }),
  css({
    output: "test.css"
  }),
  svg(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify( 'development' )
  }),
  commonjs()
];

export default {
  plugins,
  input: "./test/src/main.js",
  output: {
    file: "test/public/test.js",
    format: "umd",
    sourcemap: true
  }
};
