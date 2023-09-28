<template functional>
  <transition-group
    tag="div"
    name="graph-layer-wrapper-fade"
    :class="[
      $style['graph-layer-wrapper'],
      (props.scroll ? $style['graph-layer-wrapper--scroll'] : '')
     ]">

    <loading-state
      key="loading"
      v-if="props.loadingState && !props.hideLoading"
      :class="[data.staticClass,data.class]"
      />

    <error-state
      key="error"
      v-else-if="!props.loadingState && props.errorState && !props.hideError"
      :error="props.errorState"
      :class="[data.staticClass,data.class]"
      />

    <div
      key="content"
      v-show="!props.loadingState && !props.errorState"
      v-bind="data.attrs"
      :class="[
        $style['graph-layer-wrapper__content'],
        (props.justifyAround ? $style['graph-layer-wrapper__content--justify-around'] : ''),
        (props.justifyBetween ? $style['graph-layer-wrapper__content--justify-between'] : ''),
        data.staticClass,
        data.class
       ]"
      >
      <slot />
    </div>
  </transition-group>
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

      hideError: {
        type: Boolean,
        default: false
      },

      scroll: {
        type: Boolean,
        default: false
      },

      justifyAround: {
        type: Boolean,
        default: false
      },

      justifyBetween: {
        type: Boolean,
        default: false
      }
    }
  };
</script>

<style>
  .graph-layer-wrapper-fade-enter-active, .graph-layer-wrapper-fade-leave-active {
    transition-property: opacity;
    transition-duration: .35s;
  }
  .graph-layer-wrapper-fade-enter, .graph-layer-wrapper-fade-leave-to {
    opacity: 0;
  }
  .graph-layer-wrapper-fade-enter-active {
    transition-delay: .40s;
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>

<style module>
  .graph-layer-wrapper {
    overflow: hidden;
    flex: 1 0;
    display: flex;
    flex-flow: row nowrap;
    position: relative;
  }

  .graph-layer-wrapper a {
    color: var(--graph-layer-anchor-color);
  }

  .graph-layer-wrapper__content {
    overflow: hidden;
    flex: 1 0;
    display: flex;
    justify-content: flex-start;
    flex-flow: column nowrap;
  }
  .graph-layer-wrapper--scroll > .graph-layer-wrapper__content {
    overflow: auto;
    flex: 1 0 1px;
  }
  .graph-layer-wrapper__content--justify-around {
    justify-content: space-around;
  }
  .graph-layer-wrapper__content--justify-between {
    justify-content: space-between;
  }
</style>
