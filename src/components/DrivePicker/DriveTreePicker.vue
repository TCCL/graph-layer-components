<template>
  <div class="drive-tree-picker" :class="classes">
    <div class="header" @click="select">
      <icon :i="active ? 'arrow-down' : 'arrow-right'" />

      <span v-if="isUser">User Drives</span>
      <span v-else-if="isGroup">Group Drives</span>
      <span v-else-if="isSite">Site Drives</span>
    </div>

    <graph-layer-wrapper
      v-if="active"
      :loading-state="$loadingState"
      :error-state="$errorState"
      class="drive-tree-picker-inner"
      >
      <div
        v-for="entry in staticEntries"
        class="drive-tree-static-option"
        :class="{ active:(selectedEntry === entry) }"
        @click="selectStaticEntry(entry)"
        >
        <span>{{ entry.name }}</span>
      </div>

      <drive-tree-options
        v-for="entry in currentEntries"
        v-bind:key="entry.id"
        :type="type"
        :info="entry"
        :active="selectedEntry === entry"
        :value.sync="forwardValue"
        @select="selectEntry(entry)"
        />

      <div v-if="hasNextPage" class="drive-tree-pagination">
        <click-text
          @click="loadNextPage"
          title="Click to load additional entries in this list"
          >Load additional items</click-text>
      </div>
    </graph-layer-wrapper>
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
  import DriveTreeOptions from "./DriveTreeOptions.vue";
  import { extractQueryParam } from "../../core/helpers.js";

  import Fuse from 'fuse.js';

  function sortByName(a,b) {
    const na = a.name;
    const nb = b.name;
    return na < nb ? -1 : (na > nb ? 1 : 0);
  }

  function valueMatchesEntry(value,entry) {
    // Handle static entry.
    if (entry.value) {
      return entry.value.driveType == value.driveType
        && entry.value.driveId == value.driveId;
    }

    // Handle (non-static) entry.
    if (entry.id && entry.type) {
      return (value.driveType == "drive"
              && value.parentId == entry.id)
        || (entry.type == value.driveType
            && entry.id == value.driveId);
    }

    return false;
  }

  function makeUserEntry(user) {
    if (user.userType != "Member") {
      return null;
    }

    return {
      id: user.id,
      type: "user",
      name: user.displayName || user.userPrincipleName,
      title: user.displayName || user.userPrincipleName,
      externalLink: null
    };
  }

  function makeGroupEntry(group) {
    return {
      id: group.id,
      type: "group",
      name: group.displayName || group.id,
      title: group.description || group.displayName,
      externalLink: null
    };
  }

  function makeSiteEntry(site) {
    return {
      id: site.id,
      type: "site",
      name: site.displayName || site.name,
      title: site.description,
      externalLink: site.webUrl
    };
  }

  const EMPTY_VALUE = {
    parentId: "",
    driveId: "",
    driveType: ""
  };

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
      staticEntries: [],
      selectedEntry: null,
      nextLink: null
    }),

    props: {
      type: String,
      value: Object,
      active: Boolean,
      filterText: String
    },

    computed: {
      isUser() {
        return this.type == "user";
      },

      isGroup() {
        return this.type == "group";
      },

      isSite() {
        return this.type == "site";
      },

      classes() {
        const cls = [];

        cls.push(this.$themeClass);
        if (this.active) {
          cls.push("active");
        }

        return cls;
      },

      forwardValue: {
        get() {
          return this.value;
        },
        set(value) {
          const cpy = Object.assign({},value);
          if (this.selectedEntry && cpy.driveType == "drive") {
            cpy.parentId = this.selectedEntry.id;
          }
          this.$emit("update:value",cpy);
        }
      },

      hasNextPage() {
        return !!this.nextLink && !this.filterText;
      },

      currentEntries() {
        if (!this.filterText) {
          return this.entries;
        }

        if (this.$options.fuse) {
          return this.$options.fuse.search(this.filterText).map(x => x.item);
        }

        return [];
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

        if (this.isUser) {
          promise = this.loadUsers();
        }
        else if (this.isGroup) {
          promise = this.loadGroups();
        }
        else if (this.isSite) {
          promise = this.loadSites();
        }

        this.loaded = true;

        if (!promise) {
          return Promise.resolve();
        }

        return promise;
      },

      loadUsers() {
        // Add static entries.
        this.staticEntries.push({
          name: 'Current User',
          value: {
            driveType: "me",
            driveId: "1"
          }
        });

        // Load users from Graph.
        const endpoint = "/users";
        const url = new URL(endpoint,window.location.origin);
        url.searchParams.set("$orderby","displayName");
        url.searchParams.set("$select","id,displayName,userPrincipleName,userType");
        url.searchParams.set("$top","512");

        return this.$fetchJson(url).then((result) => {
          const users = this.processLoadResult(result,url,makeUserEntry);

          for (let i = 0;i < users.length;++i) {
            const user = users[i];
            const entry = makeUserEntry(user);
            if (!entry) {
              continue;
            }

            this.entries.push(entry);
          }

          this.entries.sort(sortByName);
        });
      },

      loadGroups() {
        const endpoint = "/groups";
        const url = new URL(endpoint,window.location.origin);

        return this.$fetchJson(url).then((result) => {
          const groups = this.processLoadResult(result,url,makeGroupEntry);

          for (let i = 0;i < groups.length;++i) {
            const group = groups[i];
            const entry = makeGroupEntry(group);
            if (!entry) {
              continue;
            }

            this.entries.push(entry);
          }

          this.entries.sort(sortByName);
        });
      },

      loadSites() {
        const endpoint = "/sites";
        const url = new URL(endpoint,window.location.origin);
        url.searchParams.set("search","*");

        return this.$fetchJson(url).then((result) => {
          const value = this.processLoadResult(result,url,makeSiteEntry);

          for (let i = 0;i < value.length;++i) {
            const site = value[i];
            const entry = makeSiteEntry(site);
            if (!entry) {
              continue;
            }

            this.entries.push(entry);
          }

          this.entries.sort(sortByName);
        });
      },

      processLoadResult(result,url,entryfn) {
        if (result["@odata.nextLink"]) {
          const skipToken = extractQueryParam(
            result["@odata.nextLink"],
            "$skiptoken"
          );
          url.searchParams.set("$skiptoken",skipToken);

          this.nextLink = {
            url,
            entryfn
          };
        }
        else {
          this.nextLink = null;
        }

        return result.value;
      },

      loadNextPage() {
        if (!this.hasNextPage) {
          return;
        }

        const { url, entryfn } = this.nextLink;

        this.$fetchJson(url).then((result) => {
          const value = this.processLoadResult(result,url,entryfn);
          for (let i = 0;i < value.length;++i) {
            const entry = entryfn(value[i]);
            if (!entry) {
              continue;
            }

            this.entries.push(entry);
          }

          this.entries.sort(sortByName);
        });
      },

      select() {
        this.$emit("select",this.type);
      },

      selectEntry(entry) {
        if (this.selectedEntry === entry) {
          this.selectedEntry = null;
        }
        else {
          this.selectedEntry = entry;
        }
      },

      selectStaticEntry(entry) {
        if (this.selectedEntry === entry) {
          this.selectedEntry = null;
          this.forwardValue = EMPTY_VALUE;
        }
        else {
          this.selectedEntry = entry;
          this.forwardValue = entry.value;
        }
      },

      selectValue() {
        this.selectedEntry = null;
        if (!this.active) {
          return;
        }

        // Search through entries for a match.
        const searchfn = valueMatchesEntry.bind(this,this.value);
        const result = this.staticEntries.concat(this.entries).find(searchfn);
        if (result) {
          this.selectEntry(result);
        }
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

      entries() {
        const options = {
          keys: ['name'],
          threshold: 0.25
        };

        this.$options.fuse = new Fuse(this.entries,options);
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
    background-color: var(--graph-layer-drive-picker-hover-color);
  }

  .drive-tree-picker.active > .header {
    border-bottom: 2px solid var(--graph-layer-drive-picker-active-color);
  }

  .drive-tree-picker .drive-tree-options,
  .drive-tree-picker .drive-tree-static-option,
  .drive-tree-picker .drive-tree-pagination {
    flex: 0 0;
    margin-left: 2em;
  }

  .drive-tree-picker .drive-tree-static-option {
    cursor: pointer;
    padding: 4px;
  }
  .drive-tree-picker .drive-tree-static-option:hover {
    background-color: var(--graph-layer-drive-picker-hover-color);
  }
  .drive-tree-picker .drive-tree-static-option.active {
    background-color: var(--graph-layer-drive-picker-selected-color);
  }

  .drive-tree-picker .drive-tree-static-option > span {
    font-style: italic;
  }

  .drive-tree-pagination {
    padding: 4px 0 4px 1.5em;
  }
</style>
