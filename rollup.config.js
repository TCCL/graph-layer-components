// rollup.config.js - @tccl/graph-layer-components

import { nodeResolve } from "@rollup/plugin-node-resolve";
import vue from "rollup-plugin-vue";
import css from "rollup-plugin-css-only";

export default {
  plugins: [
    nodeResolve(),
    vue({
      css: false
    }),
    css({
      output: "graph-layer-components.css"
    })
  ],

  input: "./src/index.js",
  output: {
    file: "dist/graph-layer-components.js",
    format: "umd",
    name: "GraphLayer"
  }
};
