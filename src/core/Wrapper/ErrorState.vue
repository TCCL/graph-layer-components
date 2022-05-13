<template>
  <div :class="$style['graph-layer-error-state']">
    <icon i="error" error xlarge />
    <span :class="$style['message']">{{ message }}</span>
    <span :class="$style['blurb']">{{ blurb }}</span>
    <slot />
  </div>
</template>

<script>
  import Icon from "../icons";
  import { isGraphLayerError, isMicrosoftError, extractErrorMessage } from "../helpers";

  export default {
    name: "ErrorState",

    components: {
      Icon
    },

    data: () => ({

    }),

    props: {
      error: {
        type: [String,Object,Boolean],
        default: "An error occurred"
      }
    },

    computed: {
      message() {
        return extractErrorMessage(this.error);
      },

      blurb() {
        if (typeof this.error === "object"
            && this.error.error
            && this.error.message)
        {
          return this.error.message;
        }

        if (typeof this.error === "object"
            && this.error.code
            && this.error.payload)
        {
          if (isGraphLayerError(this.error.payload)) {
            return this.error.payload.message;
          }
          // if (isMicrosoftError(this.error.payload)) {
          //    return this.error.payload.error.code;
          // }
        }

        return "";
      }
    },

    created() {

    },

    methods: {

    }
  };
</script>

<style module>
  .graph-layer-error-state {
    flex: 1 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column nowrap;
    text-align: center;
  }

  .message {
    font-size: 1.5em;
  }

  .blurb {
    .font-size: 0.75em;
  }
</style>
