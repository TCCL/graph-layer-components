// mixins/GraphLayerMixin.js

import LoadErrorMixin from "./LoadErrorMixin.js";
import globals from "../globals.js";
import Wrapper from "../components/Wrapper";

function findParentProp($parent,key) {
  if (!$parent) {
    return null;
  }

  if (key in $parent.$props) {
    return $parent.$props[key];
  }

  return findParentProp($parent.$parent,key);
}

export default {
  components: {
    [Wrapper.name]: Wrapper
  },

  mixins: [LoadErrorMixin],

  props: {
    graphLayer: {
      type: Object,
      default: null
    }
  },

  computed: {
    $graphLayer() {
      const inst = this.graphLayer
            || findParentProp(this.$parent,"graphLayer")
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
    }
  },

  methods: {
    $fetch(resource,init) {
      this.loading = true;
      this.error = null;
      return this.$graphLayer.fetch(resource,init).then((result) => {
        this.loading = false;
        return result;

      }).catch((error) => {
        this.loading = false;
        this.error = error;
      });
    }
  }
};
