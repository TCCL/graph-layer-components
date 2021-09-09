// mixins/GraphLayerMixin.js

import globals from "../globals.js";

export default {
  props: {
    graphLayer: {
      type: Object,
      default: null
    }
  },

  computed: {
    $graphLayer() {
      const inst = this.graphLayer || globals.graphLayer;
      if (!inst) {
        throw Error("No GraphLayer instance was available!");
      }

      return inst;
    },

    $theme() {
      return this.$graphLayer.getOption("theme");
    }
  },
};
