<template functional>
  <div :class="data.staticClass || ''" v-bind="data.attrs">
    <loading-state v-if="props.loadingState" />

    <error-state v-else-if="props.errorState" :error="props.errorState" />

    <slot v-else />
  </div>
</template>

<script>
  import LoadingState from "./LoadingState.vue";
  import ErrorState from "./ErrorState.vue";

  export default {
    name: "GraphLayerWrapper",

    components: {
      [LoadingState.name]: LoadingState,
      [ErrorState.name]: ErrorState
    },

    props: {
      loadingState: {
        type: Boolean,
        default: false
      },

      errorState: {
        type: Object,
        default: null
      }
    }
  };
</script>
