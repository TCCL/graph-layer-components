// graph-layer.js

import Vue from "vue";

import * as Components from "./components";
import globals from "./globals.js";

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
    this.options = Vue.observable({
      // The base URL of the graph-layer proxy endpoint. This can contain a
      // scheme/host if the graph-layer instance is running on another
      // domain/port.
      baseUrl: "/graph/layer",

      // The name of the cookie storing the graph-layer session ID. Components
      // will avoid calls to graph-layer if 1) this option is non-empty and 2)
      // the browser does not have a session cookie.
      cookieId: "GRAPH_LAYER_SESSID",

      // The theme class to apply to themeable components.
      theme: "default",

      // The app ID to use for anonymous requests. If this is omitted or empty,
      // then no anonymous requests are made.
      anonymousAppId: "",

      // The name of the HTTP header to use to indicate an anonymous request.
      // This must match the value configured in the graph-layer proxy endpoint
      // settings.
      anonymousHeader: "X-Graph-Layer-Anonymous",

      // Determines if an anonymous request is performed when the user does not
      // have a graph-layer session. This is the global default which may be
      // overridden at the component level.
      anonymousFallback: false
    });

    this.components = {};
    for (const key in Components) {
      this.components[key] = Components[key];
    }
  }

  getOption(key) {
    return this.options[key];
  }

  setOption(key,value) {
    if (key in this.options) {
      this.options[key] = value;
    }
  }

  setOptions(options) {
    for (const key in options) {
      if (key in this.options) {
        this.options[key] = options[key];
      }
    }
  }

  /**
   * Determines if anonymous requests can be performed.
   *
   * @return {Boolean}
   */
  isAnonymousEnabled() {
    return this.getOption("anonymousAppId") && this.getOption("anonymousHeader");
  }

  /**
   * Registers an additional component that can be created via scan
   * functionality.
   *
   * @param {string} id
   *  The component ID.
   * @param {object} component
   *  The component object.
   */
  registerScanComponent(id,component) {
    this.components[id] = component;
  }

  /**
  * Issues a graph-layer proxy request.
  *
  * @param {object} resource
  * @param {object} _init
  *
  * @return {Promise}
  */
  fetch(_resource,init) {
    let resource = _resource;

    let path;
    if (typeof resource === "string") {
      path = resource;
    }
    else if (resource instanceof URL) {
      path = resource.pathname;
    }

    // Prepare base URL to prepend to resource path name.
    let url = this.options.baseUrl;
    if (url.length > 0 && url[url.length-1] != "/" && path[0] != "/") {
      url += "/";
    }

    if (typeof resource === "string") {
      resource = url + resource;
    }
    else if (resource instanceof URL) {
      resource = new URL(resource);
      resource.pathname = url + resource.pathname;
    }

    return fetch(resource,init);
  }

  /**
   * Issues an anonymous graph-layer proxy request.
   *
   * @param {object} resource
   * @param {object} _init
   *
   * @return {Promise}
   */
  fetchAnonymous(resource,_init) {
    const init = _init || {};
    const existingHeaders = (init || {})["headers"] || null;
    const anonHeader = this.getOption("anonymousHeader");
    const anonAppId = this.getOption("anonymousAppId");

    if (existingHeaders) {
      if (Headers && existingHeaders instanceof Headers) {
        existingHeaders.set(anonHeader,anonAppId);
      }
      else {
        existingHeaders[anonHeader] = anonAppId;
      }
    }
    else {
      init["headers"] = {
        [anonHeader]: anonAppId
      };
    }

    return this.fetch(resource,init);
  }

  /**
   * Vue install method. This registers this GraphLayer instance as the default
   * instance.
   */
  install() {
    // NOTE: Do not use 'this' in this function.
    Object.values(Components).forEach((component) => {
      Vue.component(component.name,component);
    });

    globals.graphLayer = this;
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
    const ATTR_BLACKLIST = ["graphLayer"];

    if (!(attrName in elem.attributes)) {
      return null;
    }

    const componentId = elem.attributes[attrName].value;
    if (!(componentId in this.components)) {
      return null;
    }

    const args = {};
    const prefix = attrName + "--";
    for (let i = 0;i < elem.attributes.length;++i) {
      const attr = elem.attributes[i];
      if (attr.name.substring(0,prefix.length) == prefix) {
        const name = hyphen2kebab(attr.name.substring(prefix.length));
        if (ATTR_BLACKLIST.indexOf(name) >= 0) {
          throw new Error("Property '" + attr.name + "' is not supported");
        }

        args[name] = attr.value;
      }
    }

    args.graphLayer = this;

    const ctor = Vue.extend(this.components[componentId]);
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
