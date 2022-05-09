<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    :class="$style['list-content']"
    scroll
    >
    <div :class="$style['list-content__grid']" :style="gridStyles">
      <list-header
        v-for="c,i in columns"
        :key="c.id"
        :class="$style['list-content__header']"
        v-model="gridWidths[i]"
        :column="c"
        />

      <div
        v-for="item in itemList"
        :class="$style['list-content__item']"
        >
        {{ item }}
      </div>
    </div>
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  import ListHeader from "./ListHeader.vue";

  export default {
    name: "ListContent",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    components: {
      ListHeader
    },

    data: () => ({
      gridWidths: [],
      items: []
    }),

    props: {
      endpoint: String,
      columns: Array
    },

    computed: {
      gridStyles() {
        const styles = {};

        styles['grid-template-columns'] = this.gridWidths.join(" ");

        return styles;
      },

      itemList() {
        const list = [];
        const cols = this.columns.map((c) => c.name);

        for (let i = 0;i < this.items.length;++i) {
          const item = this.items[i];
          for (let j = 0;j < cols.length;++j) {
            const c = cols[j];
            if (c in item.fields) {
              list.push(item.fields[c]);
            }
            else {
              const cl = c.toLowerCase();
              list.push(item.fields[cl]);
            }
          }
        }

        return list;
      }
    },

    created() {
      this.setupGridWidths();
      this.load();
    },

    methods: {
      setupGridWidths() {
        this.gridWidths = new Array(this.columns.length);
        this.gridWidths.fill("1fr",0,this.columns.length);
      },

      load() {
        const cols = this.columns.map((c) => c.name).join(",");

        const url = new URL(this.endpoint + "/items",window.location.origin);
        url.searchParams.set("expand","fields(select=" + cols + ")");

        this.$fetchJson(url).then((result) => {
          this.items = result.value;
        });
      }
    },

    watch: {
      endpoint() {
        this.load();
      },

      columns() {
        this.setupGridWidths();
        this.load();
      }
    }
  };
</script>

<style module>
  .list-content {

  }

  .list-content__grid {
    display: grid;
    grid-template-rows: max-content;
    gap: 0.25em;
  }

  .list-content__header {
    border-bottom: 1px solid var(--graph-layer-border-color);
  }

  .list-content__item {
    border-bottom: 1px solid var(--graph-layer-border-color);
    padding: 0.25em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
