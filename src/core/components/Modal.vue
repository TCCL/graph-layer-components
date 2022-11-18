<template>
  <portal :parent="parent">
    <transition name="graph-layer-modal" appear>
      <div :class="$style['modal-wrapper']">
        <div :class="$style['modal']">
          <div :class="$style['modal__header']">
            <div :class="$style['modal__title']">{{ title }}</div>
            <div :class="$style['modal__close']">
              <icon button medium i="close-outline" @click.stop="$emit('close')" title="Close dialog" />
            </div>
          </div>
          <div :class="$style['modal__content']">
            <slot />
          </div>
        </div>
      </div>
    </transition>
  </portal>
</template>

<script>
  import Portal from "./Portal.vue";
  import Icon from "../icons/Icon.vue";

  export default {
    name: "Modal",

    components: {
      Portal,
      Icon
    },

    data: () => ({

    }),

    props: {
      parent: {
        type: null,
        validator (value) {
          if (HTMLElement && value && value instanceof HTMLElement) {
            return true
          }
          return false
        }
      },
      title: {
        type: String,
        default: ""
      }
    },

    computed: {

    },

    created() {

    },

    methods: {

    }
  };
</script>

<style>
  .graph-layer-modal-enter-active {
    animation: graph-layer-modal-popout .5s;
  }
  .graph-layer-modal-leave-active {
    animation: graph-layer-modal-popout .5s reverse;
  }

  @keyframes graph-layer-modal-popout {
    from {
      transform: scale(0);
    }

    to {
      transform: scale(1);
    }
  }
</style>

<style module>
  .modal-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--graph-layer-color-background);
    z-index: 100;
    display: flex;
    flex-flow: column nowrap;
  }

  .modal {
    flex: 1;
    border: 4px solid var(--graph-layer-color-primary);
    padding: 3rem;
    overflow: hidden;
    display: flex;
    flex-flow: column nowrap;
  }

  .modal__header {
    display: flex;
    justify-content: space-between;
    gap: 1em;
    border-bottom: 2px solid var(--graph-layer-color-primary);
  }

  .modal__title {
    font-size: 2.25rem;
    font-weight: bold;
  }

  .modal__content {
    overflow-y: auto;
  }
</style>
