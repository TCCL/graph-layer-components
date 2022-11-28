// mixins/GraphLayerMixin.js

import Cookies from "js-cookie";

import globals from "../../globals.js";
import * as WrapperComponents from "../Wrapper";
import * as coreComponents from "../components";
import Icon from "../icons";
import { nop, normalizeBoolean } from "../helpers.js";

function findParentItem($parent,undef,...keys) {
  if (!$parent) {
    return undef;
  }

  let i = 0;
  let bucket = $parent;
  while (bucket && i < keys.length) {
    const key = keys[i];
    if (typeof bucket === "object" && key in bucket) {
      bucket = bucket[key];
    }
    else {
      bucket = undef;
    }
    i += 1;
  }

  if (bucket === undef) {
    return findParentItem($parent.$parent,undef,...keys);
  }

  return bucket;
}

function modifyPromise(promise) {
  promise._then = promise.then;
  promise.then = function(handlerfn,errfn) {
    return this._then(handlerfn,errfn || nop);
  };
}

export default {
  components: {
    ...WrapperComponents,
    ...coreComponents,
    Icon
  },

  props: {
    graphLayer: {
      type: Object,
      default: null
    },

    anonymous: {
      type: [Boolean,Number,String],
      default: "fallback"
    }
  },

  filters: {
    normalizeBoolean
  },

  computed: {
    $graphLayer() {
      const inst = this.graphLayer
            || findParentItem(this.$parent,null,"$props","graphLayer")
            || globals.graphLayer;

      if (!inst) {
        throw Error("No GraphLayer instance was available!");
      }

      return inst;
    },

    $anonymous() {
      if (!this.$graphLayer.isAnonymousEnabled()) {
        return false;
      }

      // If fallback is set, fall back on a parent component value (for nested
      // components that make up a component implementation) or fall back on
      // the global "anonymousFallback" library option.
      if (this.anonymous === "fallback") {
        const parentValue = findParentItem(this.$parent,undefined,"$anonymous");
        if (typeof parentValue !== "undefined") {
          return parentValue;
        }

        return !this.$hasSession && this.$graphLayer.getOption("anonymousFallback");
      }

      return normalizeBoolean(this.anonymous);
    },

    $theme() {
      return this.$graphLayer.getOption("theme");
    },

    $themeClass() {
      return "graph-layer--theme-" + this.$theme;
    },

    $loadError() {
      if ("loadError" in this.$data) {
        return this.$data.loadError;
      }

      const result = findParentItem(this.$parent,undefined,"$data","loadError");
      if (result) {
        return result;
      }

      return globals.loadError;
    },

    $loadingState: {
      get() {
        return this.$loadError.loading >= 1;
      },
      set(value) {
        if (value) {
          this.$loadError.loading += 1;
        }
        else {
          this.$loadError.loading -= 1;
        }
      }
    },

    $errorState: {
      get() {
        return this.$loadError.error;
      },
      set(value) {
        this.$loadError.error = value;
      }
    },

    $hasSession() {
      const cookieId = this.$graphLayer.getOption("cookieId");
      const sessionId = Cookies.get(cookieId);

      return !!sessionId;
    }
  },

  methods: {
    normalizeBoolean,

    $fetch(resource,init,ignoreError) {
      this.$loadingState = true;
      this.$errorState = null;

      let promise;
      if (!this.$hasSession && !this.$anonymous) {
        promise = Promise.reject({
          error: "Content Unavailable",
          message: "You are not signed into Microsoft Graph and cannot view this content.",
        });
      }
      else {
        if (this.$anonymous) {
          promise = this.$graphLayer.fetchAnonymous(resource,init);
        }
        else {
          promise = this.$graphLayer.fetch(resource,init);
        }
        promise = promise.then((response) => {
          if (!response.ok) {
            return response.json().then((payload) => Promise.reject({
              code: response.status,
              payload
            }));
          }

          this.$loadingState = false;
          return response;
        });
      }

      promise.catch((error) => {
        this.$loadingState = false;
        if (!ignoreError) {
          this.$errorState = error;
        }
      });

      modifyPromise(promise);
      return promise;
    },

    $fetchBlob(resource,init,ignoreError) {
      const promise = this.$fetch(resource,init,ignoreError)._then((response) => {
        return response.blob();
      });

      modifyPromise(promise);
      return promise;
    },

    $fetchJson(resource,init,ignoreError) {
      const promise = this.$fetch(resource,init,ignoreError)._then((response) => {
        return response.json();
      });

      modifyPromise(promise);
      return promise;
    },

    $warn(message,...args) {
      const fmt = "[graph-layer-components]: " + message;
      console.warn(fmt,...args);
    }
  }
};
