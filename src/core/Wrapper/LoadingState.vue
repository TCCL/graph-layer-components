<template>
  <div :class="$style['graph-layer-loading-state']">
    <span :class="$style.message">{{ message }}</span>
  </div>
</template>

<script>
  export default {
    name: "LoadingState",

    data: () => ({

    }),

    props: {
      message: {
        type: String,
        default: "Loading content. Please wait…"
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

<style module>
  .graph-layer-loading-state {
    flex: 1 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .message {
    font-size: 1.5em;
    margin: 2em;
  }
</style>
