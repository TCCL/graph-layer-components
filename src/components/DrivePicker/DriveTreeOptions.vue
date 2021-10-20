<template>
  <div class="drive-tree-options" :class="classes">
    <div class="header" @click="select" :title="info.title">
      <icon :i="active ? 'arrow-down' : 'arrow-right'" />
      <span>{{ info.name }}</span>
    </div>

    <graph-layer-wrapper
      v-if="active"
      :loading-state="$loadingState"
      :error-state="$errorState"
      class="drive-tree-options-inner"
      >
      <div
        v-for="entry in entries"
        class="entry"
        :class="{ active:(entry === selectedEntry) }"
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
      entries: [],
      selectedEntry: null
    }),

    props: {
      type: String,
      info: Object,
      value: Object,
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
      // NOTE: this call handles initial loading if the instance is not loaded.
      this.applyValue();
    },

    methods: {
      applyValue() {
        // Attempt to select the value if the instance is active. This loads
        // entries if the instance is not loaded.
        if (this.active) {
          if (this.loaded) {
            this.selectValue();
          }
          else {
            this.load().then(() => {
              this.selectValue();
            });
          }
        }
        else {
          this.selectedEntry = null;
        }
      },

      load() {
        let promise;

        this.entries.splice(0);

        if (this.type == "user") {
          promise = this.loadUser();
        }
        else if (this.type == "group") {
          promise = this.loadGroup();
        }
        else if (this.type == "site") {
          promise = this.loadSite();
        }

        this.loaded = true;

        if (!promise) {
          return Promise.resolve();
        }

        return promise;
      },

      loadUser() {

      },

      loadGroup() {

      },

      loadSite() {

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
      },

      selectValue() {
        const result = this.entries.find((entry) => {
          return entry.value.driveType == this.value.driveType
            && entry.value.driveId == this.value.driveId;
        });

        this.selectedEntry = result || null;
      }
    },

    watch: {
      active() {
        // NOTE: this call handles initial loading if the instance is not
        // loaded.
        this.applyValue();
      },

      type() {
        this.entries.splice(0);
        this.loaded = false;
        this.applyValue();
      },

      selectedEntry() {
        let value;
        if (!this.selectedEntry) {
          value = {
            driveType: "",
            driveId: ""
          };
        }
        else {
          value = this.selectedEntry.value;
        }

        this.$emit("update:value",value);
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
    background-color: var(--graph-layer-drive-selected-color);
  }

  .drive-tree-options.active > .header {
    border-bottom: 2px solid var(--graph-layer-drive-active-color);
  }

  .entry {
    cursor: pointer;
    margin-left: 2em;
  }
  .entry:hover {
    background-color: var(--graph-layer-drive-selected-color);
  }
  .entry.active {
    background-color: var(--graph-layer-drive-active-color);
  }
</style>
