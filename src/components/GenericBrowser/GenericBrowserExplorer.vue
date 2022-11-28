<template>
  <graph-layer-wrapper
    v-bind="$wrapperBind"
    :class="$style['graph-layer-generic-browser-explorer']"
    scroll
   >
    <div v-if="isUnselected" :class="$style.explorer">
      <div v-for="item in items">
        <div
          :class="[
            $style['explorer__item'],
            item.id == propValue.id ? $style['explorer__item--selected'] : ''
          ]"
          @click="select(item)"
          :title="item.caption"
          >
          <icon :i="item.icon || 'folder'" :accent="item.current" large />
          <span :class="$style['explorer__item-label']">{{ item.label }}</span>
          <caption-text v-if="item.current">Current</caption-text>
        </div>
      </div>
    </div>

    <template v-else-if="children === false"></template>

    <generic-browser-explorer
      v-else-if="children.length > 0"
      ref="child"
      v-model="propValue"
      :items="children"
      :target-schema="targetSchema"
      :schema-processing="schemaProcessing"
      @nav="propNav"
      />

    <div v-else :class="$style['empty-state']">
      <span>No items</span>
    </div>

    <div v-if="hasPagination" :class="$style.pagination">
      <div :class="$style.pagination__button">
        <icon
          medium button
          i="arrow-left"
          :disabled="!hasPrevPage"
          @click.stop="previousPage"
          />
      </div>

      <div :class="$style.pagination__button">
        <icon
          medium button
          i="arrow-right"
          :disabled="!hasNextPage"
          @click.stop="nextPage"
          />
      </div>
    </div>
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
  import { extractQueryParam, sortByLabel } from "../../core/helpers.js";

  function makeURL(item) {
    const url = new URL(item.endpoint,window.location.origin);
    if (item.params) {
      const keys = Object.keys(item.params);
      for (let i = 0;i < keys.length;++i) {
        url.searchParams.set(keys[i],item.params[keys[i]]);
      }
    }
    return url;
  }

  export default {
    name: "GenericBrowserExplorer",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      selectedItem: null,
      children: false,
      pageIndex: 0,
      pages: [],

      // Is the component active in the navigation (i.e. parent with no
      // grandchildren)?
      active: false
    }),

    props: {
      value: Object,
      items: Array,
      targetSchema: String,
      schemaProcessing: Object
    },

    computed: {
      propValue: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit("input",value);
        }
      },

      isUnselected() {
        return !this.selectedItem;
      },

      hasPagination() {
        // Only render if we are a parent with no grandchildren.
        if (!this.active) {
          return false;
        }

        // More than one page.
        if (this.pages.length > 1) {
          return true;
        }

        // One page, but could load more with skip token.
        if (this.pages.length == 1 && this.pages[0][1]) {
          return true;
        }

        return false;
      },

      hasNextPage() {
        if (this.pageIndex < this.pages.length) {
          // Another forward page is already loaded.
          if (this.pageIndex < this.pages.length - 1) {
            return true;
          }

          // Most recent page has skip token.
          if (this.pages[this.pageIndex][1]) {
            return true;
          }
        }

        return false;
      },

      hasPrevPage() {
        if (this.pageIndex < this.pages.length) {
          // Another backward page is already loaded.
          if (this.pageIndex >= 1) {
            return true;
          }
        }

        return false;
      }
    },

    created() {

    },

    methods: {
      navigate(id) {
        if (this.$refs.child && this.$refs.child.navigate(id)) {
          return true;
        }

        if (this.selectedItem) {
          if (this.selectedItem.id === id) {
            return true;
          }

          this.selectedItem = null;
          this.children = false;
          this.$errorState = null;
          this.propNav();

          return false;
        }

        return false;
      },

      propNav(items) {
        let nav = [];

        if (this.selectedItem) {
          nav.push(this.selectedItem);
        }

        if (items) {
          nav = nav.concat(items);
        }

        this.$emit("nav",nav);

        // The component is active if it is the most recent entry in the
        // navigation.
        this.active = this.selectedItem
          && nav.indexOf(this.selectedItem) == nav.length-1;
      },

      select(item) {
        if (this.$loadingState) {
          return;
        }

        // Base case: selecting an item having the target schema changes the
        // value.
        if (item.schema == this.targetSchema) {
          if (this.propValue.id == item.id) {
            // Clear existing value.
            this.propValue = {};
          }
          else {
            // Set new value.
            this.propValue = {
              item,
              type: item.type,
              id: item.id,
              parentId: item.parentId
            };
          }

          return;
        }

        // Set up state to display new item in child component.
        this.children = false;
        this.pageIndex = 0;
        this.pages.splice(0);

        // Perform first fetch.
        this.fetchItems(item).finally(() => {
          this.selectedItem = item;
          this.propNav();
        });
      },

      nextPage() {
        if (!this.selectedItem) {
          return;
        }

        const index = this.pageIndex + 1;

        if (index >= this.pages.length) {
          // Fetch new list of items for next page.
          const lastIndex = this.pages.length-1;
          const [ _, skipToken ] = this.pages[lastIndex];
          if (skipToken) {
            this.fetchItems(this.selectedItem,skipToken);
            this.pages[lastIndex][1] = null;
          }
        }
        else {
          // Apply existing page entry.
          this.pageIndex = index;
          this.children = this.pages[index][0];
        }
      },

      previousPage() {
        if (!this.selectedItem) {
          return;
        }

        const index = this.pageIndex - 1;
        if (index < 0) {
          return;
        }

        // Apply existing page entry.
        this.pageIndex = index;
        this.children = this.pages[index][0];
      },

      fetchItems(item,skipToken) {
        const url = makeURL(item);
        if (skipToken) {
          url.searchParams.set("$skiptoken",skipToken);
        }

        return this.$fetchJson(url).then((result) => {
          // Set items as current children.
          this.children = this.processResult(item.schema,result,item);

          // Save page entry and skip token and update index.
          const skipToken = extractQueryParam(result["@odata.nextLink"],"$skiptoken");
          this.pageIndex = this.pages.length;
          this.pages.push([this.children,skipToken]);
        });
      },

      processResult(schema,result,parent) {
        let results = [];

        if (schema in this.schemaProcessing) {
          results = this.schemaProcessing[schema](result,parent);
        }

        results.sort(sortByLabel);

        return results;
      }
    }
  };
</script>

<style module>
  .graph-layer-generic-browser-explorer {

  }

  .empty-state {
    display: flex;
    justify-content: center;
    font-size: 1.25em;
    margin: 2em;
  }

  .explorer {
    padding: 0.5em;
    display: grid;
    grid-template-columns: repeat(5,1fr);
    gap: 1em;
  }

  .explorer__item {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    cursor: pointer;
    padding: 0.5em;
  }

  .explorer__item--selected {
    background-color: var(--graph-layer-generic-browser-hover-color);
    border: 2px solid var(--graph-layer-generic-browser-selected-color);
  }

  .explorer__item:hover {
    background-color: var(--graph-layer-generic-browser-hover-color);
  }

  .explorer__item-label {
    font-size: 1.1em;
    text-align: center;
    max-width: 12ch;
    word-break: break-word;
  }

  .pagination {
    border-top: 2px solid var(--graph-layer-generic-browser-divider-color);
    margin-top: 0.25em;
    display: flex;
    justify-content: center;
  }

  .pagination__button {
    flex: 0 0 20%;
    text-align: center;
  }
</style>
