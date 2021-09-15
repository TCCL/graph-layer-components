<template>
  <div class="graph-layer-drive-file-entry">
    <div class="name">{{ item.name }}</div>
  </div>
</template>

<script>
  export default {
    name: "FileEntry",

    data: () => ({

    }),

    props: {
      item: Object
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
  .graph-layer-drive-file-entry {
    display: flex;
  }
</style>
