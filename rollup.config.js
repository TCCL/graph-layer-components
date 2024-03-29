// rollup.config.js - @tccl/graph-layer-components

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
        generateScopedName: 'tccl-graph-layer-components-[local]-[hash:base64:4]'
      }
    }
  }),
  css({
    output: "graph-layer-components.css"
  }),
  svg(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify( 'production' )
  }),
  commonjs()
];

export default {
  plugins,
  input: "./src/index.js",
  output: [
    {
      file: "dist/graph-layer-components.js",
      format: "umd",
      name: "GraphLayer"
    },
    {
      file: "dist/graph-layer-components.esm.js",
      format: "es"
    }
  ]
};
