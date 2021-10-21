<template>
  <div class="graph-layer-error-state">
    <span class="excl-icon">!</span>
    <span class="message">{{ message }}</span>
    <span class="blurb">{{ blurb }}</span>
    <slot />
  </div>
</template>

<script>
  function isGraphLayerError(err) {
    return err.status && err.error && err.message;
  }

  function isMicrosoftError(err) {
    return typeof err.error === "object"
      && err.error.code
      && err.error.message
      && err.error.innerError;
  }

  export default {
    name: "ErrorState",

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
        if (typeof this.error === "object"
            && this.error.error
            && this.error.message)
        {
          return this.error.error;
        }

        if (typeof this.error === "object"
            && this.error.code
            && this.error.payload)
        {
          if (isGraphLayerError(this.error.payload)) {
            return this.error.payload.error;
          }
          if (isMicrosoftError(this.error.payload)) {
             return this.error.payload.error.message;
          }
        }
        else if (typeof this.error === "string") {
          return this.error;
        }

        return "An error occurred";
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

<style scoped>
  .graph-layer-error-state {
    flex: 1 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column nowrap;
    background-color: var(--graph-layer-color-error);
    border-radius: 10px;
    padding: 2em;
    text-align: center;
  }

  .excl-icon {
    font-size: 3.5em;
    font-weight: bold;
    user-select: none;
    margin: 0.25em;
  }

  .message {
    font-size: 1.5em;
  }

  .blurb {
    .font-size: 0.75em;
  }
</style>
