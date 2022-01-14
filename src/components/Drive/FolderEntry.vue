<template>
  <div :class="$style['graph-layer-drive-folder-entry']">
    <div :class="$style['navigate']" @click="navigate" :title="item.name">
      <icon i="folder" /><a :class="$style['text']">{{ item.name }}</a>
    </div>
    <div :class="$style['size']">
      <caption-text>{{ sizeFormatted }}</caption-text>
    </div>
    <div :class="$style['modified-by']">
      <a v-if="modifiedByLink" :href="modifiedByLink">{{ modifiedBy }}</a>
      <span v-else>{{ modifiedBy }}</span>
    </div>
    <div :class="$style['modified-on']">
      <caption-text>{{ modifiedDistance }}</caption-text>
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
      navigate() {
        this.$emit('click',this.item.id);
      }
    }
  };
</script>

<style module>
  .graph-layer-drive-folder-entry {
    display: flex;
    flex-flow: row nowrap;
  }
  .graph-layer-drive-folder-entry:hover {
    background-color: var(--graph-layer-drive-item-selected-background-color);
  }

  .graph-layer-drive-folder-entry > .navigate {
    flex: 6 0;
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    padding: 4px;
    display: flex;
    align-items: center;
  }
  .graph-layer-drive-folder-entry > .navigate > .text {
    margin-left: 5px;
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
    font-size: 14px;
  }

  .graph-layer-drive-folder-entry > .modified-on {
    display: flex;
    flex-flow: row-reverse;
    margin-right: 4px;
  }
</style>
