// graph-layer.js

import Vue from "vue";

import * as Components from "./components";

function hyphen2kebab(name) {
  let result = "";
  let index = 0;

  let state = 0;
  while (index < name.length) {
    if (name[index] == "-") {
      if (state == 1) {
        state = 2;
      }
    }
    else {
      if (state == 2) {
        result += name[index].toUpperCase();
      }
      else {
        result += name[index];
      }
      state = 1;
    }

    index += 1;
  }

  return result;
}

class GraphLayer {
  constructor() {
    // Apply default options.
    this.options = {
      // The base URL of the graph-layer proxy endpoint. This can contain a
      // scheme/host if the graph-layer instance is running on another
      // domain/port.
      baseURL: "/graph/layer",

      // The name of the cookie storing the graph-layer session ID. Components
      // will avoid calls to graph-layer if 1) this option is non-empty and 2)
      // the browser does not have a session cookie.
      cookieId: "GRAPH_LAYER_SESSID"
    };
  }

  setOptions(options) {
    for (const key in options) {
      if (key in this.options) {
        this.options[key] = options[key];
      }
    }
  }

  /**
   * Vue install method.
   */
  install() {
    // NOTE: Do not use 'this' in this function.
    Object.values(Components).forEach((component) => {
      Vue.component(component.name,component);
    });
  }

  /**
   * Scans the current document for an element to convert into a graph-layer
   * component. If the indicated attribute has a value matching a component ID,
   * the indicated component is loaded.
   *
   * @param {string} [attribute]
   *  The attribute name in which to find the component ID. This defaults to 
   *  'data-graph-layer'.
   * @param {string} [selector]
   *  The selector to use to query the elements. This defaults to a selector
   *  that queries elements having the indicated attribute.
   */
  scan(attribute,selector) {
    const attr = attribute || "data-graph-layer";
    const sel = selector || ("[" + attr + "]");

    const elem = document.querySelector(sel);
    if (!elem) {
      return;
    }

    this.processElement(elem,attr);
  }

  /**
   * Scans the current document for any elements to convert into graph-layer
   * components. If the indicated attribute has a value matching a component ID,
   * the indicated component is loaded.
   *
   * @param {string} [attribute]
   *  The attribute name in which to find the component ID. This defaults to 
   *  'data-graph-layer'.
   * @param {string} [selector]
   *  The selector to use to query the elements. This defaults to a selector
   *  that queries elements having the indicated attribute.
   */
  scanAll(attribute,selector) {
    const attr = attribute || "data-graph-layer";
    const sel = selector || ("[" + attr + "]");

    const elems = document.querySelectorAll(sel);

    const results = [];
    for (let i = 0;i < elems.length;++i) {
      const result = this.processElement(elems[i],attr);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Processes a DOM element to convert it into a graph-layer component.
   *
   * @param {Element} elem
   *  The Element instance to process.
   * @param {string} attrName
   *  The name of the attribute that contains the component ID. This also serves
   *  as the prefix for any argument attribute name.
   *
   * @return {object}
   *  Returns the created Vue instance or null on failure.
   */
  processElement(elem,attrName) {
    if (!(attrName in elem.attributes)) {
      return null;
    }

    const componentId = elem.attributes[attrName];
    if (!(componentId in components)) {
      return null;
    }

    const args = [];
    for (let i = 0;i < elem.attributes.length;++i) {
      const attr = elem.attributes[i];
      if (attr.name.substring(0,attr.length) == attrName && attr.name != attrName) {
        const name = hyphen2kebab(attr.name.substring(attr.length));
        args[name] = attr.value;
      }
    }

    const ctor = Vue.extend(components[componentId]);
    const inst = new ctor({
      propsData: args
    });

    inst.$mount(elem);

    return inst;
  }
}

export {
  GraphLayer
};
