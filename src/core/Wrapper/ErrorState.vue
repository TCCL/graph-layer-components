<template>
  <div class="graph-layer-error-state">
    <span class="message">{{ message }}</span>
  </div>
</template>

<script>
  export default {
    name: "ErrorState",

    data: () => ({

    }),

    props: {
      message: {
        type: String,
        default: "An error occurred"
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
    background-color: #ffaaaa;
  }

  .message {
    font-size: 1.5em;
  }
</style>
