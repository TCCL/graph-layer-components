// mixins/GraphLayerMixin.js

import Cookies from "js-cookie";

import globals from "../../globals.js";
import * as WrapperComponents from "../Wrapper";
import * as coreComponents from "../components";
import Icon from "../icons";
import { nop, string2boolean } from "../helpers.js";

function findParentItem($parent,key,subkey,undef) {
  if (!$parent) {
    return null;
  }

  if (key in $parent && subkey in $parent[key]) {
    if ($parent[key][subkey] !== undef) {
      return $parent[key][subkey];
    }
  }

  return findParentItem($parent.$parent,key,subkey);
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

    shared: {
      type: [Boolean,String],
      default: false
    }
  },

  filters: {
    string2boolean
  },

  computed: {
    $graphLayer() {
      const inst = this.graphLayer
            || findParentItem(this.$parent,"$props","graphLayer",null)
            || globals.graphLayer;

      if (!inst) {
        throw Error("No GraphLayer instance was available!");
      }

      return inst;
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

      const result = findParentItem(this.$parent,"$data","loadError");
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
    }
  },

  methods: {
    string2boolean,

    $fetch(resource,init,ignoreError) {
      this.$loadingState = true;
      this.$errorState = null;

      let promise;
      if (!this.$hasSession() && !this.shared) {
        promise = Promise.reject({
          error: "Content Unavailable",
          message: "You are not signed into Microsoft Graph and cannot view this content.",
        });
      }
      else {
        promise = this.$graphLayer.fetch(resource,init).then((response) => {
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

    $hasSession() {
      const cookieId = this.$graphLayer.getOption("cookieId");
      const sessionId = Cookies.get(cookieId);

      return !!sessionId;
    }
  }
};
