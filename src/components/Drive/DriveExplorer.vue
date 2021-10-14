<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    class="graph-layer-drive-explorer"
    >
    <div v-if="currentListing.length == 0" class="empty">
      <span class="caption">This folder is empty.</span>
    </div>

    <div class="entry-wrapper" v-for="item in currentListing">
      <folder-entry
        v-if="item.folder"
        :item="item"
        @click="navigateItem(item)"
        />

      <file-entry
        v-else
        :item="item"
        />
    </div>

    <div v-if="hasNext || page > 0" class="page-buttons-wrapper">
      <div class="page-buttons">
        <div class="page-back-button-wrapper button-wrapper">
          <icon
            i="arrow-left"
            class="button primary"
            :class="{ disabled:page<=0 }"
            @click="pageBack"
            />
        </div>

        <div class="page-forward-button-wrapper button-wrapper">
          <icon
            i="arrow-right"
            class="button primary"
            :class="{ disabled:!hasNext }"
            @click="pageForward"
            />
        </div>
      </div>
    </div>
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
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
      page: parseInt(parts[1])
    };
  }

  export default {
    name: "DriveExplorer",

    components: {
      FileEntry,
      FolderEntry
    },

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      id: "",
      page: 0,
      nav: [],
      pathParts: []
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

        return false;
      }
    },

    created() {
      this.$options.driveInfo = new Map();
      this.$options.skipTokens = new Map();

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
          endpoint += "/items/" + encodeURIComponent(id) + "/children";
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
          const skipToken = extractQueryParam(result["@odata.nextLink"],"$skiptoken");
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

      navigateItem(item) {
        // Ensure top nav item has latest page before navigation if the page
        // number changed.
        if (this.nav.length > 0) {
          const { id, page } = parseDriveKey(this.nav[this.nav.length - 1]);
          if (page != this.page) {
            this.nav[this.nav.length-1] = this.driveKey;
          }
        }

        this.pathParts.push(item.name);
        this.navigate(item.id);
      },

      navigate(id,_page) {
        this.loadPage(id,_page,(driveKey) => {
          this.nav.push(driveKey);
        });
      },

      loadPage(id,_page,donefn) {
        const page = _page || 0;
        const driveKey = makeDriveKey(id,page);

        if (this.$options.driveInfo.has(driveKey)) {
          this.id = id;
          this.page = page;
          if (typeof donefn === "function") {
            donefn(driveKey);
          }
        }
        else {
          this.fetchListing(id,page).then(() => {
            this.id = id;
            this.page = page;
            if (typeof donefn === "function") {
              donefn(driveKey);
            }
          });
        }
      },

      goBack() {
        if (this.nav.length > 1) {
          this.nav.pop();
          this.pathParts.pop();
          const { id, page } = parseDriveKey(this.nav[this.nav.length - 1]);
          this.loadPage(id,page);
        }
      },

      pageBack() {
        if (this.page <= 0) {
          return;
        }

        this.loadPage(this.id,this.page-1);
      },

      pageForward() {
        if (!this.hasNext) {
          return;
        }

        this.loadPage(this.id,this.page+1);
      },

      reset() {
        this.$options.driveInfo.clear();
        this.id = "";
        this.nav.splice(0);
        this.pathParts.splice(0);
      }
    },

    watch: {
      endpoint() {
        this.load();
      },

      pathParts() {
        this.$emit('pathParts:update',this.pathParts);
      }
    }
  };
</script>

<style scoped>
  .entry-wrapper {
    border-bottom: 1px solid var(--graph-layer-drive-row-border-color);
  }
  .entry-wrapper:last-child {
    border-bottom: none;
  }

  .empty {
    display: flex;
    justify-content: center;
  }
  .empty > span {
    margin: 2em;
  }

  .page-buttons-wrapper {
    flex: 1 0;
    margin-top: 1em;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-end;
  }

  .page-buttons {
    display: flex;
    justify-content: center;
  }
  .page-buttons > .button-wrapper {
    flex: 0 0 20%;
    text-align: center;
  }
  .page-buttons > .button-wrapper >>> .icon {
    width: 36px;
  }
</style>
