<template functional>
  <div class="graph-layer-wrapper scrollable-flex" :class="props.wrapperClass">
    <loading-state
      v-if="props.loadingState && !props.hideLoading"
      :class="[data.staticClass,data.class]"
      />

    <error-state
      v-else-if="!props.loadingState && props.errorState"
      :error="props.errorState"
      :class="[data.staticClass,data.class]"
      >

    </error-state>

    <div
      v-show="!props.loadingState && !props.errorState"
      class="graph-layer-content scrollable-flex"
      :class="[data.staticClass,data.class]"
      v-bind="data.attrs"
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
      },

      wrapperClass: {
        type: String,
        default: ""
      }
    }
  };
</script>

<style scoped>
  .graph-layer-wrapper {
    overflow: hidden;
  }

  .graph-layer-wrapper > .graph-layer-content {
    overflow: auto;
    justify-content: flex-start;
  }
  .graph-layer-wrapper.no-scroll > .graph-layer-content {
    overflow: hidden;
  }
  .graph-layer-wrapper > .graph-layer-content.justify-around {
    justify-content: space-around;
  }
</style>
