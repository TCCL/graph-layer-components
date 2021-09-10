<template>
  <div class="graph-layer-loading-state">
    <span class="message">{{ message }}</span>
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

<style scoped>
  .graph-layer-loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .message {
    font-size: 1.5em;
  }
</style>
