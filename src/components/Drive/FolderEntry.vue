<template>
  <div class="graph-layer-drive-folder-entry">
    <div class="name">{{ item.name }}</div>
  </div>
</template>

<script>
  export default {
    name: "FolderEntry",

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
  .graph-layer-drive-folder-entry {
    display: flex;
  }
</style>
