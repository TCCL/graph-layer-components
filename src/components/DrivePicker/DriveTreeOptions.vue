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
        v-if="entries.length == 0"
        class="no-entry"
        >
        <span>No drives available</span>
      </div>
      <div
        v-for="entry in entries"
        class="entry"
        :class="{ active:(entry === selectedEntry) }"
        @click="selectEntry(entry)"
        >
        <span>{{ entry.name }}</span>
      </div>

      <div v-if="hasNextPage" class="pagination">
        <click-text
          @click="loadNextPage"
          title="Click to load additional drive entries in this list"
          >Load additional drives</click-text>
      </div>
    </graph-layer-wrapper>
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
  import { extractQueryParam } from "../../core/helpers.js";

  export default {
    name: "DriveTreeOptions",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      loaded: false,
      entries: [],
      selectedEntry: null,
      nextLink: null
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
      },

      hasNextPage() {
        return !!this.nextLink;
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
        const endpoint = "/users/" + this.info.id + "/drives";
        const url = new URL(endpoint,window.location.origin);

        this.$loadingState = true;
        return this.$fetchJson(url,null,true).then((result) => {
          const defaultEndpoint = "/users/" + this.info.id + "/drive";
          const defaultUrl = new URL(defaultEndpoint,window.location.origin);

          const drives = this.processLoadResult(result,url);

          // Query the default drive so we can mark it as default.
          this.$fetchJson(defaultUrl,null,true).then((defaultDrive) => {
            if (this.nextLink) {
              this.nextLink.defaultDrive = defaultDrive;
            }
            this.processDrives(drives,defaultDrive);
            this.$loadingState = false;
          }, (err) => {
            this.processDrives(drives);
            this.$loadingState = false;
          });

        }, (err) => {
          this.$loadingState = false;
          this.processError(err);
        });
      },

      loadGroup() {
        const endpoint = "/groups/" + this.info.id + "/drives";
        const url = new URL(endpoint,window.location.origin);

        this.$loadingState = true;
        return this.$fetchJson(url,null,true).then((result) => {
          const defaultEndpoint = "/groups/" + this.info.id + "/drive";
          const defaultUrl = new URL(defaultEndpoint,window.location.origin);

          const drives = this.processLoadResult(result,url);

          // Query the default drive so we can mark it as default.
          this.$fetchJson(defaultUrl,null,true).then((defaultDrive) => {
            if (this.nextLink) {
              this.nextLink.defaultDrive = defaultDrive;
            }
            this.processDrives(drives,defaultDrive);
            this.$loadingState = false;
          }, (err) => {
            this.processDrives(drives);
            this.$loadingState = false;
          });

        }, (err) => {
          this.$loadingState = false;
          this.processError(err);
        });
      },

      loadSite() {
        const endpoint = "/sites/" + this.info.id + "/drives";
        const url = new URL(endpoint,window.location.origin);

        this.$loadingState = true;
        return this.$fetchJson(url,null,true).then((result) => {
          const defaultEndpoint = "/sites/" + this.info.id + "/drive";
          const defaultUrl = new URL(defaultEndpoint,window.location.origin);

          const drives = this.processLoadResult(result,url);

          // Query the default drive so we can mark it as default.
          this.$fetchJson(defaultUrl,null,true).then((defaultDrive) => {
            if (this.nextLink) {
              this.nextLink.defaultDrive = defaultDrive;
            }
            this.processDrives(drives,defaultDrive);
            this.$loadingState = false;

          }, (err) => {
            this.processDrives(drives);
            this.$loadingState = false;
          });

        }, (err) => {
          this.$loadingState = false;
          this.processError(err);
        });
      },

      processLoadResult(result,url,defaultDrive) {
        if (result["@odata.nextLink"]) {
          const skipToken = extractQueryParam(
            result["@odata.nextLink"],
            "$skiptoken"
          );
          url.searchParams.set("$skiptoken",skipToken);

          this.nextLink = {
            url,
            defaultDrive: defaultDrive || null
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

        const { url, defaultDrive } = this.nextLink;

        this.$fetchJson(url).then((result) => {
          const drives = this.processLoadResult(result,url,defaultDrive);
          this.processDrives(drives);
        });
      },

      processDrives(drives,defaultDrive) {
        for (let i = 0;i < drives.length;++i) {
          const drive = drives[i];
          const value = {
            driveId: drive.id
          };

          if (defaultDrive && defaultDrive.id == drive.id) {
            value.driveType = this.type;
            value.driveId = this.info.id;
          }
          else {
            value.driveType = "drive";
            value.driveId = drive.id;
          }

          this.entries.push({
            id: drive.id,
            name: drive.name,
            externalLink: drive.webUrl,
            value
          });
        }
      },

      processError(err) {
        if (err.code == 404 && err.payload.error) {
          switch (err.payload.error.code) {
          case "itemNotFound":
          case "ResourceNotFound":
            return;
          }
        }

        this.$errorState = err;
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
    background-color: var(--graph-layer-drive-picker-hover-color);
  }

  .drive-tree-options.active > .header {
    border-bottom: 2px solid var(--graph-layer-drive-picker-active-color);
  }

  .entry, .no-entry {
    padding: 4px;
  }
  .entry {
    cursor: pointer;
    margin-left: 2em;
  }
  .entry:hover {
    background-color: var(--graph-layer-drive-picker-hover-color);
  }
  .entry.active {
    background-color: var(--graph-layer-drive-picker-selected-color);
  }
  .no-entry {
    margin-left: 2em;
    font-style: italic;
  }

  .pagination {
    margin-left: 2em;
    padding: 4px 0 4px 0;
  }
</style>
