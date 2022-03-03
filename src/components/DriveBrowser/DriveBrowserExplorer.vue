<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    class="$style['graph-layer-drive-browser-explorer']"
    scroll
   >

  <div v-if="isUnselected" :class="$style.explorer">
    <div
      v-for="item in items"
      :class="$style['explorer__item']"
      @click="select(item)"
      >
      <icon i="folder" large />
      <span :class="$style['explorer__item-label']">{{ item.label }}</span>
    </div>
  </div>

  <drive-browser-explorer
    ref="child"
    v-else-if="children.length > 0"
    :items="children"
    @nav="propNav"
    />
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

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
      children: []
    }),

    props: {
      value: Object,
      items: Array
    },

    computed: {
      isUnselected() {
        return !this.selectedItem;
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
      },

      select(item) {
        if (this.$loadingState) {
          return;
        }

        this.children.splice(0);

        const url = makeURL(item);
        this.$fetchJson(url).then((result) => {
          this.children = this.processResult(item.schema,result);
          this.selectedItem = item;
          this.propNav();
        }, (err) => {
          this.selectedItem = item;
          this.propNav();
        });
      },

      processResult(schema,result) {
        let results = [];

        if (schema == "userList") {
          results = this.processResult_userList(result);
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

      processResult_driveList(result) {
        const { value: driveList } = result;

        const items = [];
        for (let i = 0;i < driveList.length;++i) {
          const drive = driveList[i];
          items.push({
            id: drive.id,
            type: "drive",
            label: drive.name,
            caption: drive.name,
            endpoint: "/drives/" + drive.id,
            schema: "drive"
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

  .explorer {
    padding: 1em;
    display: flex;
    gap: 1.5em;
    flex-flow: row wrap;
    align-items: baseline;
  }

  .explorer__item {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    cursor: pointer;
    padding: 0.5em;
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
</style>
