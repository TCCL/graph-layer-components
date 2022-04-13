<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    :class="$style['graph-layer-drive-browser-explorer']"
    scroll
   >
    <div v-if="isUnselected" :class="$style.explorer">
      <div v-for="item in items">
        <div
          :class="[
            $style['explorer__item'],
            item.id == propValue.driveId ? $style['explorer__item--selected'] : ''
          ]"
          @click="select(item)"
          :title="item.caption"
          >
          <icon i="folder" :accent="item.current" large />
          <span :class="$style['explorer__item-label']">{{ item.label }}</span>
          <caption-text v-if="item.current">Current</caption-text>
        </div>
      </div>
    </div>

    <drive-browser-explorer
      ref="child"
      v-else-if="children.length > 0"
      v-model="propValue"
      :items="children"
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
          :class="{ disabled: !hasPrevPage }"
          @click="previousPage"
          />
      </div>

      <div :class="$style.pagination__button">
        <icon
          medium button
          i="arrow-right"
          :class="{ disabled: !hasNextPage }"
          @click="nextPage"
          />
      </div>
    </div>
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
  import { extractQueryParam } from "../../core/helpers.js";

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
    name: "DriveBrowserExplorer",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      selectedItem: null,
      children: [],
      pageIndex: 0,
      pages: [],

      // Is the component active in the navigation (i.e. parent with no
      // grandchildren)?
      active: false
    }),

    props: {
      value: Object,
      items: Array
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
          this.children.splice(0);
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

        // Base case: selecting a drive changes the value.
        if (item.schema == "drive") {
          if (this.propValue.driveId == item.id) {
            // Clear existing value.
            this.propValue = {};
          }
          else {
            // Set new value.
            this.propValue = {
              item,
              driveType: "drive",
              driveId: item.id
            };
          }

          return;
        }

        // Set up state to display new item in child component.
        this.children.splice(0);
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
          this.children = this.processResult(item.schema,result);

          // Save page entry and skip token and update index.
          const skipToken = extractQueryParam(result["@odata.nextLink"],"$skiptoken");
          this.pageIndex = this.pages.length;
          this.pages.push([this.children,skipToken]);
        });
      },

      processResult(schema,result) {
        let results = [];

        if (schema == "userList") {
          results = this.processResult_userList(result);
        }
        else if (schema == "groupList") {
          results = this.processResult_groupList(result);
        }
        else if (schema == "siteList") {
          results = this.processResult_siteList(result);
        }
        else if (schema == "driveList") {
          results = this.processResult_driveList(result);
        }

        return results;
      },

      processResult_userList(result) {
        const { value: userList } = result;

        const items = [];
        for (let i = 0;i < userList.length;++i) {
          const user = userList[i];
          items.push({
            id: user.id,
            type: "user",
            label: user.displayName,
            caption: user.jobTitle || user.displayName,
            endpoint: "/users/" + user.id + "/drives",
            schema: "driveList"
          });
        }

        return items;
      },

      processResult_groupList(result) {
        const { value: groupList } = result;

        const items = [];
        for (let i = 0;i < groupList.length;++i) {
          const group = groupList[i];
          items.push({
            id: group.id,
            type: "group",
            label: group.displayName,
            caption: group.description || group.displayName,
            endpoint: "/groups/" + group.id + "/drives",
            schema: "driveList"
          });
        }

        return items;
      },

      processResult_siteList(result) {
        const { value: siteList } = result;

        const items = [];
        for (let i = 0;i < siteList.length;++i) {
          const site = siteList[i];
          items.push({
            id: site.id,
            type: "site",
            label: site.displayName,
            caption: site.description || site.displayName,
            endpoint: "/sites/" + site.id + "/drives",
            schema: "driveList"
          });
        }

        return items;
      },

      processResult_driveList(result) {
        const { value: driveList } = result;

        const items = [];
        for (let i = 0;i < driveList.length;++i) {
          const drive = driveList[i];
          items.push({
            id: drive.id,
            type: "drive",
            label: drive.name,
            caption: drive.description || drive.name,
            endpoint: "/drives/" + drive.id,
            schema: "drive",
            webUrl: drive.webUrl
          });
        }

        return items;
      }
    }
  };
</script>

<style module>
  .graph-layer-drive-browser-explorer {

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
    background-color: var(--graph-layer-drive-browser-hover-color);
    border: 2px solid var(--graph-layer-drive-browser-selected-color);
  }

  .explorer__item:hover {
    background-color: var(--graph-layer-drive-browser-hover-color);
  }

  .explorer__item-label {
    font-size: 1.1em;
    text-align: center;
    max-width: 12ch;
    word-break: break-word;
  }

  .pagination {
    border-top: 2px solid var(--graph-layer-drive-browser-divider-color);
    margin-top: 0.25em;
    display: flex;
    justify-content: center;
  }

  .pagination__button {
    flex: 0 0 20%;
    text-align: center;
  }
</style>
