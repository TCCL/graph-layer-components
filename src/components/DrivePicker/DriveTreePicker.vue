<template>
  <div class="drive-tree-picker" :class="classes">
    <div class="header" @click="select">
      <icon :i="active ? 'arrow-down' : 'arrow-right'" />

      <span v-if="isMe">My Drives</span>
      <span v-else-if="isUser">User Drives</span>
      <span v-else-if="isGroup">Group Drives</span>
      <span v-else-if="isSite">Site Drives</span>
    </div>

    <graph-layer-wrapper
      v-if="active"
      :loading-state="$loadingState"
      :error-state="$errorState"
      class="graph-layer-drive-tree-picker-inner"
      >
      <drive-tree-options
        v-for="entry in entries"
        v-bind:key="entry.id"
        :type="type"
        :info="entry"
        :active="selectedEntry === entry"
        :id.sync="forwardId"
        @select="selectEntry(entry)"
        />
    </graph-layer-wrapper>
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
  import DriveTreeOptions from "./DriveTreeOptions.vue";

  function sortByName(a,b) {
    const na = a.name;
    const nb = b.name;
    return na < nb ? -1 : (na > nb ? 1 : 0);
  }

  export default {
    name: "DriveTreePicker",

    components: {
      DriveTreeOptions
    },

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
      id: String,
      active: Boolean
    },

    computed: {
      isMe() {
        return this.type == 'me';
      },

      isUser() {
        return this.type == 'user';
      },

      isGroup() {
        return this.type == 'group';
      },

      isSite() {
        return this.type == 'site';
      },

      classes() {
        const cls = [];

        cls.push(this.$themeClass);
        if (this.active) {
          cls.push("active");
        }

        return cls;
      },

      forwardId: {
        get() {
          return this.id;
        },
        set(value) {
          this.$emit('id:update',value);
        }
      }
    },

    created() {

    },

    methods: {
      load() {
        this.entries.splice(0);

        if (this.isMe) {

        }
        else if (this.isUser) {
          this.loadUsers();
        }
        else if (this.isGroup) {
          this.loadGroups();
        }
        else if (this.isSite) {
          this.loadSites();
        }

        this.loaded = true;
      },

      loadSites() {
        const endpoint = "/sites";
        const url = new URL(endpoint,window.location.origin);
        url.searchParams.set("search","*");

        this.$fetchJson(url).then((result) => {
          for (let i = 0;i < result.value.length;++i) {
            const siteInfo = result.value[i];

            const entry = {
              name: siteInfo.displayName || siteInfo.name,
              title: siteInfo.description,
              id: siteInfo.id,
              externalLink: siteInfo.webUrl
            };

            this.entries.push(entry);
          }

          this.entries.sort(sortByName);
        });
      },

      select() {
        if (!this.loaded) {
          this.load();
        }

        this.$emit('select',this.type);
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
      }
    }
  };
</script>

<style scoped>
  .drive-tree-picker {

  }

  .drive-tree-picker > .header {
    flex: 0 0;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .drive-tree-picker > .header:hover {
    background-color: var(--graph-layer-drive-selected-background-color);
  }

  .drive-tree-picker.active > .header {
    border-bottom: 2px solid var(--graph-layer-color-primary);
  }

  .drive-tree-picker .drive-tree-options {
    margin-left: 2em;
  }

  .drive-tree-picker .drive-tree-options {
    flex: 0 0;
  }
</style>
