<template>
  <graph-layer-generic-browser
    target-schema="list"
    v-model="selection"
    :schema-processing="schemaProcessing"
    :title="title"
    :domain-label="domainLabel"
    :items="items"
    >
    <input v-if="formElement" type="hidden" :name="formElement" :value="storageValue" />

    <component
      v-if="widget && isSelected"
      :is="widget"
      v-model="storage.config"
      :class="$style['widget']"
      :list-id="storage.id"
      :site-id="storage.parentId"
      />

    <template v-if="true" #footer>
      <generic-browser-options-form
        enable-sites
        :schema-processing="schemaProcessing"
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

  import ListBrowserColumnWidget from "./ListBrowserColumnWidget.vue";
  import ListBrowserEventsConfigWidget from "./ListBrowserEventsConfigWidget.vue";
  import ListBrowserSchemaProcessing from "./ListBrowserSchemaProcessing.js";

  function makeEndpoint(storageType,id,parentId) {
    switch (storageType) {
    case "list":
      return "/sites/" + parentId + "/lists/" + id;
    }

    throw new Error("Cannot make endpoint: invalid storage type");
  }

  function defaultConfigValue(listType) {
    switch (listType) {
      case "generic":
        return [];
      case "events":
        return null;
    }

    throw new Error("Invalid list type");
  }

  function validateConfigValue(value,listType) {
    switch (listType) {
      case "generic":
        if (Array.isArray(value)) {
          return value;
        }
        break;
      case "events":
        if (typeof value === "object") {
          return value;
        }
        break;
    }

    return defaultConfigValue(listType);
  }

  export default {
    name: "GraphLayerListBrowser",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin,
      StorageMixin
    ],

    components: {
      GraphLayerGenericBrowser,
      GenericBrowserOptionsForm
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
        default: "Select a site list"
      },

      formElement: {
        // Name of hidden form element to create for <form> submission.
        type: String,
        default: ""
      },

      browseSites: {
        type: [Boolean,String],
        default: true
      },

      browseFollowedSites: {
        type: [Boolean,String],
        default: false
      },

      listType: {
        type: String,
        default: "generic"
      },

      filterTemplate: {
        type: [Array,String],
        default: []
      }
    },

    computed: {
      items() {
        return this.topLevelItems.concat(this.manualItems);
      },

      topLevelItems() {
        const items = [];

        if (this.string2boolean(this.browseSites)) {
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

        if (this.string2boolean(this.browseFollowedSites)) {
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
        let filters = [];
        if (Array.isArray(this.filterTemplate)) {
          filters = this.filterTemplate;
        }
        else if (this.filterTemplate) {
          filters = this.filterTemplate.split(":");
        }

        if (filters.length > 0) {
          return ListBrowserSchemaProcessing.getFilteredByTemplate(filters);
        }

        return ListBrowserSchemaProcessing.getDefault();
      },

      selection: {
        get() {
          return {
            type: this.storage.type,
            id: this.storage.id
          };
        },

        set({ type, id, parentId }) {
          this.storage.type = type || "";
          this.storage.id = id || "";
          this.storage.parentId = parentId || "";
          this.storage.listType = this.listType;
          this.storage.config = defaultConfigValue(this.listType);
        }
      },

      isSelected() {
        return this.storage.type == "list"
          && this.storage.id != ""
          && this.storage.parentId != "";
      },

      widget() {
        if (this.storage.listType == "generic") {
          return ListBrowserColumnWidget;
        }
        else if (this.storage.listType == "events") {
          return ListBrowserEventsConfigWidget;
        }

        return false;
      }
    },

    created() {
      this.registerStorageKey("parentId","p");
      this.registerStorageKey("listType","l",this.listType);
      this.registerStorageKey("config","c",defaultConfigValue(this.listType));
      this.$options.manualIdTop = 1;
    },

    methods: {
      applyValue(repr) {
        // Called from StorageMixin.created()

        if (repr.t && repr.i && repr.p) {
          const endpoint = makeEndpoint(repr.t,repr.i,repr.p);
          this.$fetchJson(endpoint).then((list) => {
            const parent = { id: repr.p };
            const result = { value: [list] };
            const [ item ] = ListBrowserSchemaProcessing.listList(result,parent);

            item.current = true;

            this.storage.type = item.type;
            this.storage.id = item.id;
            this.storage.parentId = item.parentId;
            this.storage.listType = item.listType || this.listType;
            if (repr.c) {
              this.storage.config = validateConfigValue(repr.c,this.storage.listType);
            }
            else if (repr.cs) {
              // NOTE: this maintains compatibility with previous storage key.
              this.storage.config = validateConfigValue(repr.cs,this.storage.listType);
            }
            else {
              this.storage.config = defaultConfigValue(this.storage.listType);
            }

            this.addManualItem(item);
          });
        }
        else {
          this.storage.type = "";
          this.storage.id = "";
          this.storage.parentId = "";
          this.storage.listType = this.listType;
          this.storage.config = defaultConfigValue(this.listType);
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
  .widget {
    flex: 1.5;
    border-top: 2px solid var(--graph-layer-divider-color);
  }
</style>
