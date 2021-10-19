<template functional>
  <div
    class="graph-layer-wrapper"
    :class="(props.scroll ? ' scroll' : '')"
    >
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
      class="graph-layer-content"
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

      scroll: {
        type: Boolean,
        default: false
      }
    }
  };
</script>

<style scoped>
  .graph-layer-wrapper {
    overflow: hidden;
    flex: 1 0;
    display: flex;
    flex-flow: column nowrap;
  }

  .graph-layer-wrapper > .graph-layer-content {
    overflow: hidden;
    flex: 1 0;
    display: flex;
    justify-content: flex-start;
    flex-flow: column nowrap;
  }
  .graph-layer-wrapper.scroll > .graph-layer-content {
    overflow: auto;
    flex: 1 0 1px;
  }
  .graph-layer-wrapper > .graph-layer-content.justify-around {
    justify-content: space-around;
  }
</style>
