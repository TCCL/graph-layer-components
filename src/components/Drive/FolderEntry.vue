<template>
  <div :class="$style['graph-layer-drive-folder-entry']">
    <div :class="$style['name']" @click="navigate" :title="item.name">
      <div :class="$style['name__navigate']">
        <icon i="folder" /><a :class="$style['name__navigate-text']">{{ item.name }}</a>
      </div>

      <div :class="$style['name__dircount']">
        <span>{{ item.folder.childCount}} item{{ item.folder.childCount == 1 ? '' : 's' }}</span>
      </div>
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

  .graph-layer-drive-folder-entry .name {
    cursor: pointer;
    flex: 6 0;
    font-size: 14px;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .graph-layer-drive-folder-entry .name__navigate {
    flex: 1.5 0;
    padding: 4px;
    display: flex;
    align-items: center;
  }

  .graph-layer-drive-folder-entry .name__navigate-text {
    margin-left: 5px;
  }
  .graph-layer-drive-folder-entry .name:hover .name__navigate-text {
    text-decoration: underline;
    font-weight: bold;
  }

  .graph-layer-drive-folder-entry .name__dircount {
    flex: 1 0;
    font-size: 13px;
    color: var(--graph-layer-color-dark-gray);
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
