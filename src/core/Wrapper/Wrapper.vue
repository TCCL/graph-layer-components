<template functional>
  <transition-group
    tag="div"
    name="graph-layer-wrapper-fade"
    :class="[
      (props.scroll ? $style.scroll : ''),
      $style['graph-layer-wrapper']
     ]">

    <loading-state
      key="loading"
      data-
      v-if="props.loadingState && !props.hideLoading"
      :class="[data.staticClass,data.class]"
      />

    <error-state
      key="error"
      v-else-if="!props.loadingState && props.errorState"
      :error="props.errorState"
      :class="[data.staticClass,data.class]"
      />

    <div
      key="content"
      v-show="!props.loadingState && !props.errorState"
      :class="[
        $style['graph-layer-content'],
        (props.justifyAround ? $style['justify-around'] : ''),
        data.staticClass,
        data.class
       ]"
      v-bind="data.attrs"
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

      scroll: {
        type: Boolean,
        default: false
      },

      justifyAround: {
        type: Boolean,
        default: false
      }
    }
  };
</script>

<style>
  .graph-layer-wrapper-fade-enter-active, .graph-layer-wrapper-fade-leave-active {
    transition-property: opacity;
    transition-duration: .25s;
  }
  .graph-layer-wrapper-fade-enter, .graph-layer-wrapper-fade-leave-to {
    opacity: 0;
  }
  .graph-layer-wrapper-fade-enter-active {
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
    flex-flow: column nowrap;
    position: relative;
  }

  .graph-layer-wrapper a {
    color: var(--graph-layer-anchor-color);
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
