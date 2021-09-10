<template functional>
  <div class="graph-layer-wrapper">
    <loading-state v-if="props.loadingState && !props.hideLoading" />

    <error-state
      v-else-if="!props.loadingState && props.errorState"
      :error="props.errorState"
      />

    <div
      v-show="!props.loadingState && !props.errorState"
      :class="[data.staticClass,data.class]" v-bind="data.attrs"
      >
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    name: "GraphLayerWrapper",

    props: {
      loadingState: {
        type: Boolean,
        default: false
      },

      errorState: {
        type: Object,
        default: null
      },

      hideLoading: {
        type: Boolean,
        default: false
      }
    }
  };
</script>
