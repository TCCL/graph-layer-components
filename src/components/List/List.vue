<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    :class="[$themeClass,$style['graph-layer-list']]"
    >
    LIST
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  export default {
    name: "GraphLayerList",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      listInfo: {}
    }),

    props: {
      value: {
        type: String,
        default: "{}"
      }
    },

    computed: {
      parsedValue() {
        try {
          const repr = JSON.parse(this.value);
          if (repr.t && repr.i && repr.p && repr.t == "list") {
            return repr;
          }

        } catch (ex) {
          // break
        }

        return false;
      },

      endpoint() {
        if (this.parsedValue) {
          return "/sites/" + this.parsedValue.p + "/lists/" + this.parsedValue.i;
        }

        return false;
      }
    },

    created() {
      this.load();
    },

    methods: {
      load() {
        this.listInfo = {};

        if (!this.endpoint) {
          return;
        }
      }
    },

    watch: {
      endpoint(hasEndpoint) {
        this.load();
      }
    }
  };
</script>

<style module>
  .graph-layer-list {
    color: blue;
  }
</style>
