<template>
  <graph-layer-generic-browser
    target-schema="drive"
    v-model="selection"
    :schema-processing="schemaProcessing"
    :title="title"
    :domain-label="domainLabel"
    :items="items"
    >
    <input v-if="formElement" type="hidden" :name="formElement" :value="storageValue" />

    <drive-browser-config-widget
      v-if="isSelected"
      v-model="storage.config"
      :class="$style['config-widget']"
      />

    <template v-if="enableSites" #options>
      <generic-browser-options-form
        :schema-processing="schemaProcessing"
        :enable-sites="enableSites"
        @submit="addManualItem"
        />
    </template>
  </graph-layer-generic-browser>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
  import StorageMixin from "../../core/mixins/StorageMixin.js";
  import GraphLayerGenericBrowser from "../GenericBrowser/GenericBrowser.vue";
  import GenericBrowserOptionsForm from "../GenericBrowser/GenericBrowserOptionsForm.vue";

  import DriveBrowserConfigWidget from "./DriveBrowserConfigWidget.vue";
  import DriveSchemaProcessing from "./DriveSchemaProcessing.js";

  function makeEndpoint(driveType,id) {
    switch (driveType) {
    case "drive":
      return "/drives/" + id;
    case "user":
      return "/users/" + id + "/drive";
    case "group":
      return "/groups/" + id + "/drive";
    case "site":
      return "/sites/" + id + "/drive";
    }

    throw new Error("Cannot make endpoint: invalid drive value");
  }

  export default {
    name: "GraphLayerDriveBrowser",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin,
      StorageMixin
    ],

    components: {
      GraphLayerGenericBrowser,
      GenericBrowserOptionsForm,
      DriveBrowserConfigWidget
    },

    data: () => ({
      manualItems: []
    }),

    props: {
      domainLabel: {
        type: String,
        default: "My Organization"
      },

      title: {
        type: String,
        default: "Select a document library"
      },

      formElement: {
        // Name of hidden form element to create for <form> submission.
        type: String,
        default: ""
      },

      browseMe: {
        type: [Boolean,String],
        default: false
      },

      browseUsers: {
        type: [Boolean,String],
        default: false
      },

      browseGuests: {
        type: [Boolean,String],
        default: false
      },

      browseGroups: {
        type: [Boolean,String],
        default: false
      },

      browseSites: {
        type: [Boolean,String],
        default: false
      },

      browseFollowedSites: {
        type: [Boolean,String],
        default: false
      }
    },

    computed: {
      enableSites() {
        return this.normalizeBoolean(this.browseSites)
          || this.normalizeBoolean(this.browseFollowedSites);
      },

      items() {
        return this.topLevelItems.concat(this.manualItems);
      },

      topLevelItems() {
        const items = [];

        if (this.normalizeBoolean(this.browseMe)) {
          items.push({
            id: "toplv-me",
            type: "toplv",
            label: "My Documents",
            endpoint: "/me/drives",
            schema: "driveList"
          });
        }

        if (this.normalizeBoolean(this.browseUsers)) {
          items.push({
            id: "toplv-users",
            type: "toplv",
            label: "Users",
            endpoint: "/users",
            params: {
              "$filter": "userType eq 'Member'",
              "$select": "id,displayName,jobTitle,userType"
            },
            schema: "userList"
          });
        }

        if (this.normalizeBoolean(this.browseGuests)) {
          items.push({
            id: "toplv-guests",
            type: "toplv",
            label: "Guests",
            endpoint: "/users",
            params: {
              "$filter": "userType eq 'Guest'",
              "$select": "id,displayName,jobTitle,userType"
            },
            schema: "userList"
          });
        }

        if (this.normalizeBoolean(this.browseGroups)) {
          items.push({
            id: "toplv-groups",
            type: "toplv",
            label: "Groups",
            endpoint: "/groups",
            params: {
              "$orderby": "displayName",
              "$select": "id,displayName,description"
            },
            schema: "groupList"
          });
        }

        if (this.normalizeBoolean(this.browseSites)) {
          items.push({
            id: "toplv-sites",
            type: "toplv",
            label: "Sites",
            endpoint: "/sites",
            params: {
              "search": "*",
              "$select": "id,displayName,description"
            },
            schema: "siteList"
          });
        }

        if (this.normalizeBoolean(this.browseFollowedSites)) {
          items.push({
            id: "toplv-followed-sites",
            type: "toplv",
            label: "My Followed Sites",
            caption: "Browse sites that you follow",
            endpoint: "/me/followedSites",
            params: {
              "$select": "id,displayName,description"
            },
            schema: "siteList"
          });
        }

        return items;
      },

      schemaProcessing() {
        return DriveSchemaProcessing;
      },

      selection: {
        get() {
          return {
            type: this.storage.type,
            id: this.storage.id
          };
        },

        set({ type, id }) {
          this.storage.type = type || "";
          this.storage.id = id || "";
          this.storage.config = null;
        }
      },

      isSelected() {
        return this.storageType == "drive"
          && this.storageId != "";
      }
    },

    created() {
      this.registerStorageKey("config","c",null);
      this.$options.manualIdTop = 1;
    },

    methods: {
      applyValue(repr) {
        // Called from StorageMixin.created()

        if (repr.t && repr.i) {
          const endpoint = makeEndpoint(repr.t,repr.i);
          this.$fetchJson(endpoint).then((drive) => {
            const [ item ] = DriveSchemaProcessing.driveList({
              value: [drive]
            });

            item.current = true;

            this.storage.type = item.type;
            this.storage.id = drive.id;

            if (repr.c) {
              this.storage.config = repr.c;
            }
            else {
              this.storage.config = null;
            }

            this.addManualItem(item);
          });
        }
        else {
          this.storage.type = "";
          this.storage.id = "";
        }
      },

      addManualItem(item) {
        // Prevent duplicates.
        const found = this.manualItems.find((x) => x.endpoint == item.endpoint);
        if (found) {
          return;
        }

        if (!item.id) {
          const id = this.$options.manualIdTop++;
          item.id = "toplv-manual-" + id.toString();
          item.type = "toplv";
        }

        this.manualItems.push(item);
      }
    }
  };
</script>

<style module>
  .config-widget {
    flex: 1.5;
    border-top: 2px solid var(--graph-layer-divider-color);
  }
</style>
