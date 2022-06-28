<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
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

    <list-content
      v-if="ready"
      :class="$style['graph-layer-list__content']"
      :endpoint="endpoint"
      :columns="selectedColumns"
      :limit="limit"
      />
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  import ListContent from "./ListContent.vue";

  export default {
    name: "GraphLayerList",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    components: {
      ListContent
    },

    data: () => ({
      listInfo: {},
      columnInfo: {}
    }),

    props: {
      value: {
        type: String,
        default: "{}"
      },

      columns: {
        type: [String,Array],
        default: ""
      },

      overrideLabel: {
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
        if (this.parsedValue) {
          if (Array.isArray(this.parsedValue.c)) {
            columns = this.parsedValue.c;
          }
          else if (Array.isArray(this.parsedValue.cs)) {
            // NOTE: this maintains backwards compatibility with previous storage
            // key.
            columns = this.parsedValue.cs;
          }
        }

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

        const result = [];
        for (let i = 0;i < columns.length;++i) {
          const key = columns[i];
          if (key in this.columnInfo) {
            result.push(this.columnInfo[key]);
          }
        }

        return result;
      },

      ready() {
        return this.selectedColumns.length > 0;
      },

      endpoint() {
        if (this.parsedValue) {
          return "/sites/" + this.parsedValue.p + "/lists/" + this.parsedValue.i;
        }

        return false;
      },

      label() {
        if (this.overrideLabel.length > 0) {
          return this.overrideLabel;
        }

        return this.listInfo.displayName;
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
