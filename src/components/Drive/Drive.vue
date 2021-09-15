<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    class="graph-layer-drive"
    :class="[$themeClass]"
    >

  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  export default {
    name: "GraphLayerDrive",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({

    }),

    props: {
      id: {
        type: String,
        default: null
      },

      groupId: {
        type: String,
        default: null
      },

      siteId: {
        type: String,
        default: null
      },

      userIdOrPrincipleName: {
        type: String,
        default: null
      },

      me: {
        type: [Boolean,String],
        default: false
      }
    },

    computed: {
      endpoint() {
        if (this.me) {
          return "/me/drive";
        }

        if (this.userIdOrPrincipleName) {
          return "/users/" + this.userIdOrPrincipleName + "/drive";
        }

        if (this.siteId) {
          return "/sites/" + this.siteId + "/drive";
        }

        if (this.groupId) {
          return "/groups/" + this.groupId + "/drive";
        }

        if (this.id) {
          return "/drives/" + this.id;
        }

        return null;
      }
    },

    created() {

    },

    methods: {

    }
  };
</script>

<style scoped>

</style>
