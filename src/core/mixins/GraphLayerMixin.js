// mixins/GraphLayerMixin.js

import globals from "../../globals.js";
import * as WrapperComponents from "../Wrapper";

function findParentItem($parent,key,subkey) {
  if (!$parent) {
    return null;
  }

  if (key in $parent) {
    return $parent[key][subkey];
  }

  return findParentProp($parent.$parent,key,subkey);
}

export default {
  components: WrapperComponents,

  props: {
    graphLayer: {
      type: Object,
      default: null
    }
  },

  computed: {
    $graphLayer() {
      const inst = this.graphLayer
            || findParentItem(this.$parent,"$props","graphLayer")
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
    $fetch(resource,init) {
      this.$loadingState = true;
      this.$errorState = null;
      return this.$graphLayer.fetch(resource,init).then((result) => {
        this.$loadingState = false;
        return result;

      }).catch((error) => {
        this.$loadingState = false;
        this.$errorState = error;
      });
    },

    $fetchBlob(resource,init) {
      return this.$fetch(resource,init).then((response) => {
        return response.blob();
      });
    },

    $fetchJson(resource,init) {
      return this.$fetch(resource,init).then((response) => {
        return response.json();
      });
    }
  }
};
