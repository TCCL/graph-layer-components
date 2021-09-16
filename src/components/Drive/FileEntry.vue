<template>
  <div class="graph-layer-drive-file-entry">
    <div class="navigate" @click="navigate" :title="item.name">
      <icon i="file" class="secondary" /><a class="text" @click="navigate">{{ item.name }}</a>
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
    name: "FileEntry",

    mixins: [EntryMixin],

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
    flex-flow: row nowrap;
  }
  .graph-layer-drive-file-entry:hover {
    background-color: var(--graph-layer-drive-item-selected-background-color);
  }

  .graph-layer-drive-file-entry > .navigate {
    flex: 6 0;
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    padding: 4px;
    display: flex;
    align-items: center;
  }
  .graph-layer-drive-file-entry > .navigate >>> .icon {
    margin-right: 5px;
  }
  .graph-layer-drive-file-entry > .navigate:hover > .text {
    text-decoration: underline;
    font-weight: bold;
  }

  .graph-layer-drive-file-entry > .size,
  .graph-layer-drive-file-entry > .modified-by,
  .graph-layer-drive-file-entry > .modified-on {
    flex: 2 0;
    display: flex;
    align-items: center;
  }

  .graph-layer-drive-file-entry > .modified-on {
    text-align: right;
  }
</style>
