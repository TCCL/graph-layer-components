<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    class="graph-layer-user"
    :class="[$themeClass]"
    >
    <avatar :endpoint="endpoint" />
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../mixins/GraphLayerMixin.js";
  import Avatar from "./Avatar.vue";

  export default {
    name: "GraphLayerUser",

    components: {
      Avatar
    },

    mixins: [GraphLayerMixin],

    data: () => ({

    }),

    props: {
      id: {
        type: String,
        default: null
      },

      userPrincipleName: {
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
          return "/me";
        }

        if (this.id) {
          return "/users/" + this.id;
        }

        if (this.userPrincipleName) {
          return "/users/" + this.userPrincipleName;
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
