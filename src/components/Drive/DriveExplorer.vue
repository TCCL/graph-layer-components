<template>
  <div class="graph-layer-drive-explorer">
    <div class="header">
      <div class="column name">Name</div>
      <div class="column">Size</div>
      <div class="column">Last Modified By</div>
      <div class="column last-modified">Last Modified</div>
    </div>

    <div class="entry-wrapper" v-for="item in currentListing">
      <folder-entry
        v-if="item.folder"
        :item="item"
        />

      <file-entry
        v-else
        :item="item"
        />
    </div>
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import FolderEntry from "./FolderEntry.vue";
  import FileEntry from "./FileEntry.vue";
  import { extractQueryParam } from "../../core/helpers.js";

  function makeDriveKey(id,_page) {
    const page = _page || 0;

    return id + ":" + page;
  }

  function parseDriveKey(driveKey) {
    const parts = driveKey.split(":");
    return {
      id: parts[0],
      page: parts[1]
    };
  }

  export default {
    name: "DriveExplorer",

    components: {
      FileEntry,
      FolderEntry
    },

    mixins: [GraphLayerMixin],

    driveInfo: new Map(),
    skipTokens: new Map(),

    data: () => ({
      id: "",
      page: 0,
      nav: []
    }),

    props: {
      endpoint: String,
      top: {
        type: [Number,String],
        default: null
      }
    },

    computed: {
      driveKey() {
        return makeDriveKey(this.id,this.page);
      },

      currentInfo() {
        if (this.$options.driveInfo.has(this.driveKey)) {
          return this.$options.driveInfo.get(this.driveKey);
        }

        return null;
      },

      currentListing() {
        if (this.currentInfo) {
          return this.currentInfo.listing;
        }
        return [];
      },

      hasNext() {
        if (this.currentInfo) {
          return this.currentInfo.hasNext;
        }
      }
    },

    created() {
      this.load();
    },

    methods: {
      load() {
        this.reset();
        this.navigate("root");
      },

      fetchListing(id,_page) {
        const page = _page || 0;
        const driveKey = makeDriveKey(id,page);

        let endpoint;
        endpoint = this.endpoint;
        if (id == "root") {
          endpoint += "/root/children";
        }
        else {
          endpoint += "/" + encodeURIComponent(id) + "/children";
        }

        const url = new URL(endpoint,window.location.origin);

        if (this.top) {
          url.searchParams.set("$top",this.top);
        }
        if (this.$options.skipTokens.has(driveKey)) {
          const skipToken = this.$options.skipTokens.get(driveKey);
          url.searchParams.set("$skiptoken",skipToken);
        }

        return this.$fetchJson(url).then((result) => {
          const skipToken = extractQueryParam(result["@odata.nextLink"]);
          if (skipToken) {
            const nextKey = makeDriveKey(id,page+1);
            this.$options.skipTokens.set(nextKey,skipToken);
          }

          this.$options.driveInfo.set(driveKey, {
            id,
            page,
            hasNext: ( !!skipToken ),
            listing: result.value
          });
        });
      },

      navigate(id,_page) {
        const page = _page || 0;
        const driveKey = makeDriveKey(id,page);

        if (this.$options.driveInfo.has(driveKey)) {
          this.id = id;
          this.page = page;
          this.nav.push(driveKey);
        }
        else {
          this.fetchListing(id,page).then(() => {
            this.id = id;
            this.page = page;
            this.nav.push(driveKey);
          });
        }
      },

      goBack() {
        if (this.nav.length > 1) {
          const { id, page } = parseKey(this.nav.pop());
          this.id = id;
          this.page = page;
        }
      },

      reset() {
        this.$options.driveInfo.clear();
        this.id = "";
        this.nav.splice(0);
      }
    },

    watch: {
      endpoint() {
        this.load();
      }
    }
  };
</script>

<style scoped>
  .header {
    display: flex;
    border-bottom: 2px solid var(--graph-layer-drive-row-border-color);
  }
  .header > .column {
    font-size: 12px;
    font-weight: bold;
    padding: 0.5em 0;
    flex: 2 0;
  }
  .header > .column.name {
    flex: 6 0;
  }
  .header > .column.last-modified {
    text-align: right;
  }

  .entry-wrapper {
    border-bottom: 1px solid var(--graph-layer-drive-row-border-color);
  }
  .entry-wrapper:last-child {
    border-bottom: none;
  }
</style>
