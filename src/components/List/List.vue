<template>
  <graph-layer-wrapper
    v-bind="$wrapperBind"
    :class="[$themeClass,$style['graph-layer-list']]"
    >
    <div :class="$style['graph-layer-list__header']">
      <h2 :title="listInfo.description">{{ label }}</h2>

      <div :class="$style['graph-layer-list__header-toolbar']">
        <icon
          button
          i="external-link"
          @click="openExternal"
          title="Open in Microsoft portal"
          />
      </div>
    </div>

    <component v-if="ready" v-bind="content" />
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  import ListContent from "./ListContent.vue";
  import EventListContent from "./EventListContent.vue";

  export default {
    name: "GraphLayerList",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      listInfo: {},
      columnInfo: {}
    }),

    props: {
      value: {
        type: String,
        default: "{}"
      },

      id: {
        type: String,
        default: ""
      },

      siteId: {
        type: String,
        default: ""
      },

      columns: {
        type: [String,Array],
        default: ""
      },

      config: {
        type: [String,Object],
        default: ""
      },

      children: {
        // NOTE: The children property is only used for the "events" list type.
        // It is a list of child lists having the structure:
        //   { id, siteId, config }.
        type: Array,
        default: null
      },

      overrideLabel: {
        type: String,
        default: ""
      },

      listType: {
        type: String,
        default: ""
      },

      top: {
        type: [Number,String],
        default: null
      }
    },

    computed: {
      parsedValue() {
        try {
          const repr = JSON.parse(this.value);
          if (repr.t && repr.i && repr.p && repr.t == "list") {
            return repr;
          }

        } catch (ex) {
          // break
        }

        return false;
      },

      selectedColumns() {
        let columns = [];

        if (Array.isArray(this.columns)) {
          columns = this.columns;
        }
        else if (this.columns) {
          try {
            const result = JSON.parse(this.columns);
            if (Array.isArray(result)) {
              columns = result;
            }
            else if (typeof result === "string") {
              columns = result.split(",");
            }
            else {
              this.$warn("cannot parse 'columns' property");
            }

          } catch (ex) {
            this.$warn("cannot parse 'columns' property");
          }
        }
        else if (this.parsedValue) {
          if (Array.isArray(this.parsedValue.c)) {
            columns = this.parsedValue.c;
          }
          else if (Array.isArray(this.parsedValue.cs)) {
            // NOTE: this maintains backwards compatibility with previous storage
            // key.
            columns = this.parsedValue.cs;
          }
        }

        const result = [];
        for (let i = 0;i < columns.length;++i) {
          const key = columns[i];
          if (key in this.columnInfo) {
            result.push(this.columnInfo[key]);
          }
        }

        return result;
      },

      selectedConfig() {
        let config = null;

        if (this.config && typeof this.config === "object") {
          config = this.config;
        }
        else if (this.config) {
          try {
            const result = JSON.parse(this.config);
            if (result && typeof result === "object") {
              config = result;
            }
            else {
              this.$warn("cannot parse 'config' property");
            }
          } catch (ex) {
            this.$warn("cannot parse 'config' property");
          }
        }
        else if (this.parsedValue) {
          if (this.parsedValue.c && typeof this.parsedValue.c === "object") {
            config = this.parsedValue.c;
          }
        }

        return config;
      },

      ready() {
        switch (this.selectedListType) {
        case "generic":
          return this.selectedColumns.length > 0;
        }

        return true;
      },

      selectedId() {
        if (this.id) {
          return this.id;
        }
        if (this.parsedValue && this.parsedValue.i) {
          return this.parsedValue.i;
        }

        return false;
      },

      selectedSiteId() {
        if (this.siteId) {
          return this.siteId;
        }
        if (this.parsedValue && this.parsedValue.p) {
          return this.parsedValue.p;
        }

        return false;
      },

      endpoint() {
        if (this.selectedId && this.selectedSiteId) {
          return "/sites/" + this.selectedSiteId + "/lists/" + this.selectedId;
        }

        return false;
      },

      label() {
        if (this.overrideLabel.length > 0) {
          return this.overrideLabel;
        }

        return this.listInfo.displayName;
      },

      selectedListType() {
        if (this.listType) {
          return this.listType;
        }
        if (this.parsedValue && this.parsedValue.l) {
          return this.parsedValue.l;
        }

        return "generic";
      },

      childEventLists() {
        if (this.selectedListType != "events") {
          return [];
        }

        let list;
        if (Array.isArray(this.children)) {
          list = this.children.filter((item) => item.id && item.siteId);
        }
        else if (this.parsedValue && this.parsedValue._) {
          list = this.parsedValue._.filter(
            (item) => typeof item === "object"
              && item.t == "list"
              && item.l == "events"
              && item.i
              && item.p
          );
        }
        else {
          list = [];
        }

        return list.map((item) => {
          const child = {};

          if (item.id && item.siteId) {
            child.endpoint = `/sites/${item.siteId}/lists/${item.id}`;
          }
          else if (item.i && item.p) {
            child.endpoint = `/sites/${item.p}/lists/${item.i}`;
          }

          if (item.config) {
            child.config = item.config;
          }
          else if (item.c && typeof item.c === "object") {
            child.config = item.c;
          }
          else {
            child.config = null;
          }

          return child;
        });
      },

      content() {
        switch (this.selectedListType) {
        case "events":
          return {
            is: EventListContent,
            "class": this.$style["graph-layer-list__content"],
            endpoint: this.endpoint,
            config: this.selectedConfig,
            children: this.childEventLists
          };
        default:
          break;
        }

        return {
          is: ListContent,
          "class": this.$style["graph-layer-list__content"],
          endpoint: this.endpoint,
          columns: this.selectedColumns,
          limit: this.limit
        };
      },

      limit() {
        let top = this.top;
        if (typeof top !== "number") {
          top = parseInt(top);
        }
        if (isNaN(top)) {
          top = 0;
        }

        return top;
      }
    },

    created() {
      this.load();
    },

    methods: {
      load() {
        this.listInfo = {};
        this.columnInfo = {};

        if (!this.endpoint) {
          return;
        }

        this.$fetchJson(this.endpoint).then((info) => {
          this.listInfo = info;
        });

        const columnEndpoint = this.endpoint + "/columns";
        this.$fetchJson(columnEndpoint).then((result) => {
          const { value: columnDefs } = result;

          const columnMap = {};
          for (let i = 0;i < columnDefs.length;++i) {
            const def = columnDefs[i];
            columnMap[def.id] = def;
            columnMap[def.name] = def;
          }

          this.columnInfo = columnMap;
        });
      },

      openExternal() {
        if (this.listInfo.webUrl) {
          window.open(this.listInfo.webUrl,"_blank");
        }
      }
    },

    watch: {
      endpoint(hasEndpoint) {
        this.load();
      }
    }
  };
</script>

<style module>
  .graph-layer-list {

  }

  .graph-layer-list__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--graph-layer-divider-color);
  }

  .graph-layer-list__header-toolbar {

  }

  .graph-layer-list__content {
    flex: 1;
    margin: 0.25em 0.25em 0.25em;
    overflow-x: auto;
  }
</style>
