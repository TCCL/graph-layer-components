<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    >
    <p>TODO</p>
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  export default {
    name: "GraphLayerGenericCalendar",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({

    }),

    props: {
      eventProvider: Function
    },

    computed: {
      queryEvents() {
        return this.eventProvider.bind(this);
      }
    },

    created() {

    },

    methods: {

    }
  };
</script>

<style module>

</style>
