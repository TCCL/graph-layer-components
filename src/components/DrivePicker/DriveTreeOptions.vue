<template>
  <div class="drive-tree-options scrollable-flex" :class="classes">
    <div class="header" @click="select" :title="info.title">
      <icon :i="active ? 'arrow-down' : 'arrow-right'" />
      <span>{{ info.name }}</span>
    </div>

    <graph-layer-wrapper
      v-show="active"
      :loading-state="$loadingState"
      :error-state="$errorState"
      class="graph-layer-drive-tree-options-inner"
      >
      <div
        v-for="entry in entries"
        class="entry"
        @click="selectEntry"
        >
        <span>{{ entry.name }}</span>
      </div>
    </graph-layer-wrapper>
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  export default {
    name: "DriveTreeOptions",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      loaded: false,
      entries: [{ name:"test" }],
      selectedEntry: null
    }),

    props: {
      type: String,
      info: Object,
      active: Boolean
    },

    computed: {
      classes() {
        const cls = [];

        cls.push(this.$themeClass);
        if (this.active) {
          cls.push("active");
        }

        return cls;
      }
    },

    created() {

    },

    methods: {
      load() {

        this.loaded = true;
      },

      select() {
        if (!this.loaded) {
          this.load();
        }

        this.$emit('select',this.info);
      },

      selectEntry(entry) {
        if (this.selectedEntry === entry) {
          this.selectedEntry = null;
        }
        else {
          this.selectedEntry = entry;
        }
      }
    },

    watch: {
      type() {
        this.entries.splice(0);
        this.loaded = false;
      },

      selectedEntry() {
        let id;
        if (!this.selectedEntry) {
          id = null;
        }
        else {
          id = this.selectedEntry.id;
        }

        this.$emit('id:update',id);
      }
    }
  };
</script>

<style scoped>
  .drive-tree-options > .header {
    flex: 0 0;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .drive-tree-options > .header:hover {
    background-color: var(--graph-layer-drive-selected-background-color);
  }

  .entry {
    cursor: pointer;
    margin-left: 2em;
  }
  .entry:hover {
    background-color: var(--graph-layer-drive-selected-background-color);
  }
</style>
