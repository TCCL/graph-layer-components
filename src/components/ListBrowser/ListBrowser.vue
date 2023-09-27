<template>
  <graph-layer-generic-browser
    target-schema="list"
    v-model="selection"
    @item:update="setItem"
    :schema-processing="schemaProcessing"
    :title="title"
    :domain-label="domainLabel"
    :items="items"
    >
    <input v-if="formElement" type="hidden" :name="formElement" :value="storageValue" />

    <template v-if="listType == 'events'" #header>
      <div :class="$style['header']">
        <div :class="$style['header__nav']">
          <div
            v-for="item,index in selectedItems"
            v-if="item !== null"
            class="$style['header__nav-item']"
            >
            <click-text
              @click="selectItem(index)"
              :disabled="index === selectedItemIndex || !selectedItems[selectedItemIndex]"
              >{{ item.label }}</click-text>
          </div>
        </div>

        <div :class="$style['header__actions']">
          <click-text
            accent
            @click="removeSecondary"
            :disabled="selectedItems.length < 2"
            >{{ selectedItems[selectedItemIndex] ? 'Remove' : 'Cancel' }}</click-text>
          <click-text
            @click="pushSecondary"
            :disabled="!isSelected">Add Secondary Calendar</click-text>
        </div>
      </div>
    </template>

    <component
      v-if="widget && isSelected"
      :is="widget"
      v-model="storage.config"
      :class="$style['config-widget']"
      :list-id="storage.id"
      :site-id="storage.parentId"
      />

    <template #options>
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
      manualItems: [],
      selectedItemIndex: 0,
      selectedItems: [null]
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
        default: () => ([])
      }
    },

    computed: {
      items() {
        return this.topLevelItems.concat(this.manualItems.filter((x) => !!x));
      },

      topLevelItems() {
        const items = [];

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
      this.registerStorageKey("listType","l");
      this.registerStorageKey("config","c",defaultConfigValue(this.listType));
      this.storage.listType = this.listType;
      this.$options.manualIdTop = 1;
    },

    methods: {
      applyValue(repr,index) {
        // Called from StorageMixin.created()

        if (!repr || !(repr.i && repr.t && repr.p)) {
          const storage = this.getStorageAtIndex(index);
          if (storage) {
            storage.type = "";
            storage.id = "";
            storage.parentId = "";
            storage.listType = this.listType;
            storage.config = defaultConfigValue(this.listType);
          }
          return;
        }

        let storage;
        if (index != 0) {
          this.selectedItems.push(null);
          storage = this.pushStorage(true);
        }
        else {
          storage = this.storage;
        }

        const endpoint = makeEndpoint(repr.t,repr.i,repr.p);
        this.$fetchJson(endpoint).then((list) => {
          const parent = { id: repr.p };
          const result = { value: [list] };
          const [ item ] = this.schemaProcessing.listList(result,parent);

          item.current = true;
          this.setManualItem(item,index);
          this.$set(this.selectedItems,index,item);

          storage.type = item.type;
          storage.id = item.id;
          storage.parentId = item.parentId;
          storage.listType = item.listType || this.listType;
          if (repr.c) {
            storage.config = validateConfigValue(repr.c,storage.listType);
          }
          else if (repr.cs) {
            // NOTE: this maintains compatibility with previous storage key.
            storage.config = validateConfigValue(repr.cs,storage.listType);
          }
          else {
            storage.config = defaultConfigValue(storage.listType);
          }
        });
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
      },

      setManualItem(item,index) {
        if (index < 0) {
          return;
        }

        for (let i = this.manualItems.length;i <= index;++i) {
          this.manualItems.push(null);
        }

        if (!item.id) {
          const id = this.$options.manualIdTop++;
          item.id = "toplv-manual-" + id.toString();
          item.type = "toplv";
        }

        this.$set(this.manualItems,index,item);
      },

      pushSecondary() {
        this.selectedItemIndex = this.selectedItems.length;
        this.selectedItems.push(null);
        this.pushStorage();
      },

      removeSecondary() {
        if (this.selectedItems.length < 2) {
          return;
        }

        this.selectedItems.splice(this.selectedItemIndex,1);
        this.selectedItemIndex = this.removeStorage(this.selectedItemIndex);
      },

      setItem(item) {
        this.selectedItems[this.selectedItemIndex] = item;
      },

      selectItem(index) {
        this.selectedItemIndex = index;
        this.selectStorage(index);
      }
    },

    watch: {
      listType() {
        this.registerStorageKey("config","c",defaultConfigValue(this.listType));
      }
    }
  };
</script>

<style module>
  .header {
    display: flex;
    justify-content: space-between;
  }

  .header__nav {
    display: flex;
    justify-content: flex-start;
    gap: 1em;
  }

  .header__nav-item {
    padding: 0.5em;
    border-right: 3px solid var(--graph-layer-divider-color);
  }
  .header__nav-item:last-child {
    border-right: none;
  }

  .header__actions {
    display: flex;
    justify-content: flex-end;
    gap: 1em;
  }

  .config-widget {
    flex: 1.5;
    border-top: 2px solid var(--graph-layer-divider-color);
  }
</style>
