// rollup.config.js - @tccl/graph-layer-components

import { nodeResolve } from "@rollup/plugin-node-resolve";
import vue from "rollup-plugin-vue";
import css from "rollup-plugin-css-only";
import replace from "@rollup/plugin-replace";

export default {
  plugins: [
    nodeResolve(),
    vue({
      css: false
    }),
    css({
      output: "graph-layer-components.css"
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    })
  ],

  input: "./src/index.js",
  output: {
    file: "dist/graph-layer-components.js",
    format: "umd",
    name: "GraphLayer"
  }
};
