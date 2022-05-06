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

    <list-browser-column-widget
      v-if="isSelected"
      v-model="storage.columns"
      :class="$style['column-widget']"
      :list-id="storage.id"
      :site-id="storage.parentId"
      />

    <template v-else #footer>
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
  import ListBrowserSchemaProcessing from "./ListBrowserSchemaProcessing.js";

  function makeEndpoint(type,id,parentId) {
    switch (type) {
    case "list":
      return "/sites/" + parentId + "/lists/" + id;
    }

    throw new Error("Cannot make endpoint: invalid value");
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
      GenericBrowserOptionsForm,
      ListBrowserColumnWidget
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
        return ListBrowserSchemaProcessing;
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
        }
      },

      isSelected() {
        return this.storage.type == "list"
          && this.storage.id != ""
          && this.storage.parentId != "";
      }
    },

    created() {
      this.registerStorageKey("parentId","p");
      this.registerStorageKey("columns","cs",[]);
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
            if (repr.cs) {
              this.storage.columns = repr.cs;
            }
            else {
              this.storage.columns = [];
            }

            this.addManualItem(item);
          });
        }
        else {
          this.storage.type = "";
          this.storage.id = "";
          this.storage.parentId = "";
          this.storage.columns = [];
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
  .column-widget {
    flex: 1.5;
    border-top: 2px solid var(--graph-layer-divider-color);
  }
</style>
