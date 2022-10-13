// test/main.js

import Vue from "vue";
import "./base.css";
import * as testComponents from "./components";
import GraphLayer from "../../src";

// Create GraphLayer instance and scan for elements.
const graphLayer = new GraphLayer();
graphLayer.setOption("anonymousAppId","test-app");
Vue.use(graphLayer);
for (const key in testComponents) {
  graphLayer.registerScanComponent(key,testComponents[key]);
}
graphLayer.scanAll();
