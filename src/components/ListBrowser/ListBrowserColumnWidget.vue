<template>
  <div :class="[$style['list-browser-column-widget'],'graph-layer']">
    <div :class="$style.header">
      <h3>Select the columns to display</h3>
      <div>If you do not select any columns, then all columns will be displayed.</div>
    </div>

    <graph-layer-wrapper
      :loading-state="$loadingState"
      :error-state="$errorState"
      scroll
      >
      <div :class="$style['column-wrapper']">
        <div
          v-for="c,i in columns"
          :title="c.info.description"
          :class="[$style.column,c.selected ? $style['column--selected'] : '']"
          @click="selectColumn(c,i)"
          >
          <span>{{ c.info.displayName }}</span>
        </div>
      </div>
    </graph-layer-wrapper>
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  export default {
    name: "ListBrowserColumnWidget",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      columns: []
    }),

    props: {
      value: Array,
      listId: String,
      siteId: String
    },

    computed: {
      endpoint() {
        return "/sites/" + this.siteId + "/lists/" + this.listId + "/columns";
      },

      selected() {
        const list = [];

        for (let i = 0;i < this.columns.length;++i) {
          const col = this.columns[i];
          if (col.selected) {
            list.push(col.info.id);
          }
        }

        return list;
      }
    },

    created() {
      this.load();
    },

    methods: {
      load() {
        this.$fetchJson(this.endpoint).then((result) => {
          const { value: cols } = result;

          this.columns.splice(0);
          for (let i = 0;i < cols.length;++i) {
            this.columns.push({
              selected: false,
              info: cols[i]
            });
          }

          this.sync();
        });
      },

      sync() {
        const map = new Map();
        for (let i = 0;i < this.columns.length;++i) {
          const col = this.columns[i];
          col.selected = false;
          map.set(col.info.id,col);
          map.set(col.info.name,col);
        }

        for (let i = 0;i < this.value.length;++i) {
          const col = map.get(this.value[i]);
          if (col) {
            this.selectColumn(col);
          }
        }
      },

      selectColumn(column,index) {
        column.selected = !column.selected;

        let currentIndex;
        if (typeof index === "undefined") {
          currentIndex = this.columns.indexOf(column);
        }
        else {
          currentIndex = index;
        }

        this.columns.splice(currentIndex,1);

        let i = 0;
        while (i < this.columns.length && this.columns[i].selected) {
          i += 1;
        }

        this.columns.splice(i,0,column);
      }
    },

    watch: {
      endpoint() {
        this.load();
      },

      value(newValue) {
        if (newValue === this.selected) {
          return;
        }

        this.sync();
      },

      selected() {
        this.$emit("input",this.selected);
      }
    }
  };
</script>

<style module>
  .list-browser-column-widget {

  }

  .header {
    margin-bottom: 1em;
  }

  .column-wrapper {
    margin: 1.5em;
    display: flex;
    flex-flow: row wrap;
    align-items: baseline;
    gap: 1.5em;
  }

  .column {
    padding: 0.75em;
    border-radius: 10px;
    border: 1px solid black;
    cursor: pointer;
    user-select: none;
  }

  .column:hover {
    border-color: var(--graph-layer-color-primary);
  }

  .column--selected {
    font-weight: bold;
    background-color: var(--graph-layer-color-primary);
  }
</style>
