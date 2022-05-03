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

    <template v-if="browseSites" #footer>
      <drive-browser-options-form
        :enable-sites="!!browseSites"
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

  import DriveBrowserOptionsForm from "./DriveBrowserOptionsForm.vue";
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
      DriveBrowserOptionsForm
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
      items() {
        return this.topLevelItems.concat(this.manualItems);
      },

      topLevelItems() {
        const items = [];

        if (this.browseMe) {
          items.push({
            id: "toplv-me",
            type: "toplv",
            label: "My Documents",
            endpoint: "/me/drives",
            schema: "driveList"
          });
        }

        if (this.browseUsers) {
          items.push({
            id: "toplv-users",
            type: "toplv",
            label: "Users",
            endpoint: "/users",
            params: {
              "$orderby": "displayName",
              "$select": "id,displayName,jobTitle,userType"
            },
            schema: "userList"
          });
        }

        if (this.browseGroups) {
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

        if (this.browseSites) {
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

        if (this.browseFollowedSites) {
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
        }
      }
    },

    created() {
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

            this.addManualItem(item);
          });
        }
        else {
          this.storage.type = "";
          this.storage.id = "";
        }
      },

      navigate(item) {
        this.$refs.explorer.navigate(item.id);
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
  .graph-layer-drive-browser {

  }

  .header {
    border-bottom: 3px solid var(--graph-layer-drive-browser-divider-color);
    padding: 0.75em 0;
  }

  .header__title {
    display: flex;
  }

  .header__info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .header__nav {
    padding: 0.25em 0;
  }

  .header__nav-item {
    padding: 0.5em;
    border-right: 3px solid var(--graph-layer-drive-browser-divider-color);
  }

  .header__nav-item:last-child {
    border-right: none;
  }

  .header__nav-item--active {
    font-weight: bold;
  }

  .header__selected {
    display: flex;
    align-items: center;
    gap: 0.25em;
  }

  .header__selected-label {
    font-size: 0.9em;
    font-weight: bold;
  }

  .footer {
    display: flex;
    flex-flow: column nowrap;
  }

  .footer__menu--toggled {
    border-bottom: 2px solid var(--graph-layer-drive-browser-divider-color);
    padding-bottom: 0.5em;
  }

  .footer-icon {
    vertical-align: text-bottom;
  }
</style>
