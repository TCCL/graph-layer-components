<template>
  <div class="graph-layer-drive-folder-entry">
    <div class="navigate" @click="navigate" :title="item.name">
      <icon i="folder" /><a class="text" @click="navigate">{{ item.name }}</a>
    </div>
    <div class="size">
      <span class="caption">{{ sizeFormatted }}</span>
    </div>
    <div class="modified-by">
      <a v-if="modifiedByLink" :href="modifiedByLink">{{ modifiedBy }}</a>
      <span v-else>{{ modifiedBy }}</span>
    </div>
    <div class="modified-on">
      <span class="caption">{{ modifiedOn }}</span>
    </div>
  </div>
</template>

<script>
  import EntryMixin from "./EntryMixin.js";

  export default {
    name: "FolderEntry",

    mixins: [EntryMixin],

    data: () => ({

    }),

    props: {

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
    flex-flow: row nowrap;
  }

  .graph-layer-drive-folder-entry > .navigate {
    flex: 6 0;
    cursor: pointer;
    user-select: none;
    font-size: 16px;
    padding: 4px;
    margin-right: 5px;
    display: flex;
    align-items: center;
  }
  .graph-layer-drive-folder-entry > .navigate > .icon {
    margin-right: 5px;
  }
  .graph-layer-drive-folder-entry > .navigate:hover {
    background-color: var(--drive-item-selected-background-color);
  }
  .graph-layer-drive-folder-entry > .navigate:hover > .text {
    text-decoration: underline;
    font-weight: bold;
  }

  .graph-layer-drive-folder-entry > .size,
  .graph-layer-drive-folder-entry > .modified-by,
  .graph-layer-drive-folder-entry > .modified-on {
    flex: 2 0;
    display: flex;
    align-items: center;
  }

  .graph-layer-drive-folder-entry > .modified-on {
    text-align: right;
  }
</style>
