<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    :class="[$themeClass,$style['graph-layer-list']]"
    >
    <div :class="$style.header">
      <h2 :title="listInfo.description">{{ label }}</h2>

      <div :class="$style.header__toolbar">
        <icon
          button
          i="external-link"
          @click="openExternal"
          title="Open in Microsoft portal"
          />
      </div>
    </div>

    <div v-if="ready" :class="$style['list-grid']" :style="gridStyles">
      <list-header
        v-for="c,i in selectedColumns"
        :key="c.id"
        :class="$style['list-grid-header']"
        v-model="grid.widths[i]"
        :column="c"
        />

    </div>
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  import ListHeader from "./ListHeader.vue";

  export default {
    name: "GraphLayerList",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    components: {
      ListHeader
    },

    data: () => ({
      listInfo: {},
      columnInfo: {},
      rows: [],
      grid: {
        widths: []
      }
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
        if (Array.isArray(this.parsedValue.cs)) {
          columns = this.parsedValue.cs;
        }

        if (Array.isArray(this.columns)) {
          columns = this.columns;
        }

        try {
          const result = JSON.parse(this.columns);
          if (Array.isArray(result)) {
            columns = result;
          }
          else if (typeof result === "string") {
            columns = result.split(",");
          }

        } catch (ex) {
          // break
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

      gridStyles() {
        const styles = {};

        styles['grid-template-columns'] = this.grid.widths.join(" ");

        return styles;
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
      },

      selectedColumns(cs) {
        this.grid.widths = new Array(cs.length);
        this.grid.widths.fill("1fr",0,cs.length);
      }
    }
  };
</script>

<style module>
  .graph-layer-list {

  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--graph-layer-divider-color);
  }

  .header__toolbar {

  }

  .list-grid {
    flex: 1;
    margin: 0.25em 0.25em 0.25em;
    overflow-x: auto;
    display: grid;
    grid-template-rows: max-content;
    gap: 0.25em;
  }

  .list-grid-header {
    border-bottom: 1px solid var(--graph-layer-border-color);
  }
</style>
