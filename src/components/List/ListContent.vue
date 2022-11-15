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
        :selected="sortColumn === c"
        @select="sortColumn = c"
        />

      <div
        v-for="item,i in itemList"
        :class="$style['list-content__item']"
        >
        <list-content-value :value="item" :column="columns[i % columns.length]" />
      </div>
    </div>

    <div v-if="hasNextPage || pageNumber > 0" :class="$style['list-content__pagination']">
      <div :class="$style['list-content__pagination-buttons']">
        <div :class="$style['list-content__pagination-button-wrapper']">
          <icon
            medium button
            i="arrow-left"
            :disabled="pageNumber <= 0"
            @click.stop="pageBack"
            />
        </div>

        <div :class="$style['list-content__pagination-button-wrapper']">
          <icon
            medium button
            i="arrow-right"
            :disabled="!hasNextPage"
            @click.stop="pageForward"
            />
        </div>
      </div>
    </div>
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
  import { extractQueryParam, sortBy } from "../../core/helpers.js";

  import ListHeader from "./ListHeader.vue";
  import ListContentValue from "./ListContentValue.js";

  export default {
    name: "ListContent",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    components: {
      ListHeader,
      ListContentValue
    },

    data: () => ({
      gridWidths: [],
      items: [],
      pageNumber: -1,
      sortColumn: null
    }),

    props: {
      endpoint: String,
      columns: Array,
      limit: Number
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

        const items = this.items.slice();
        if (this.sortColumn) {
          const c = this.sortColumn.name;
          items.sort(sortBy((item) => {
            return item.fields[c];
          }));
        }

        for (let i = 0;i < items.length;++i) {
          const item = items[i];
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
      },

      hasNextPage() {
        const next = this.pageNumber + 1;
        const nextPage = this.$options.pages.get(next);

        if (nextPage) {
          return !!nextPage.skipToken;
        }

        return false;
      }
    },

    created() {
      this.$options.pages = new Map();

      if (this.columns.length > 0) {
        this.sortColumn = this.columns[0];
      }
      this.setupGridWidths();
      this.loadPage(0);
    },

    methods: {
      setupGridWidths() {
        this.gridWidths = new Array(this.columns.length);
        this.gridWidths.fill("1fr",0,this.columns.length);
      },

      loadPage(pageNumber) {
        const page = this.$options.pages.get(pageNumber);
        if (page && page.items) {
          this.items = page.items;
          this.pageNumber = pageNumber;
        }
        else {
          this.load(pageNumber);
        }
      },

      load(pageNumber) {
        const cols = this.columns.map((c) => c.name).join(",");

        const url = new URL(this.endpoint + "/items",window.location.origin);
        url.searchParams.set("expand","fields(select=" + cols + ")");
        if (this.limit > 0) {
          url.searchParams.set("$top",this.limit);
        }

        const page = this.$options.pages.get(pageNumber) || {};
        if (page.skipToken) {
          url.searchParams.set("$skiptoken",page.skipToken);
        }

        this.$fetchJson(url).then((result) => {
          // Store items in page dictionary.
          page.items = result.value;
          this.$options.pages.set(pageNumber,page);

          // Create entry for next page if we have a next link skip token.
          const skipToken = extractQueryParam(result["@odata.nextLink"],"$skiptoken");
          if (skipToken) {
            const nextPage = {
              skipToken
            };

            this.$options.pages.set(pageNumber+1,nextPage);
          }

          // Update render state.
          this.items = result.value;
          this.pageNumber = pageNumber;
        });
      },

      reset() {
        this.$options.pages.clear();
        this.loadPage(0);
      },

      pageForward() {
        if (!this.hasNextPage) {
          return;
        }

        const n = this.pageNumber + 1;
        this.loadPage(n);
      },

      pageBack() {
        if (this.pageNumber <= 0) {
          return;
        }

        const n = this.pageNumber - 1;
        this.loadPage(n);
      }
    },

    watch: {
      endpoint() {
        this.reset();
      },

      columns() {
        if (this.columns.length > 0) {
          this.sortColumn = this.columns[0];
        }
        this.setupGridWidths();
        this.reset();
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

  .list-content__value--boolean {
    border-radius: 1.5em;
    font-weight: bold;
    padding: 0.125em 0.5em;
    border: 2px solid var(--graph-layer-border-color);
  }

  .list-content__value--boolean-yes {
    background-color: var(--graph-layer-color-primary);
  }

  .list-content__value--boolean-no {
    background-color: var(--graph-layer-color-secondary);
  }

  .list-content__value--currency-US::before {
    content: "$";
  }

  .list-content__pagination {
    flex: 1 0;
    margin-top: 1em;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-end;
  }

  .list-content__pagination-buttons {
    display: flex;
    justify-content: center;
  }
  .list-content__pagination-button-wrapper {
    flex: 0 0 20%;
    text-align: center;
  }
  .list-content__pagination-button-wrapper >>> .icon {
    width: 36px;
  }
</style>
