<template>
  <div :class="[$style['list-browser-events-config-widget'],'graph-layer']">
    <p>Pending</p>
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  export default {
    name: "ListBrowserEventsConfigWidget",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      columns: []
    }),

    props: {
      value: [Object],
      listId: String,
      siteId: String
    },

    computed: {
      endpoint() {
        return "/sites/" + this.siteId + "/lists/" + this.listId + "/columns";
      },

      selected() {
        const config = {};

        return config;
      }
    },

    created() {
      this.load();
    },

    methods: {
      load() {

      },

      sync() {

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
  .list-browser-events-config-widget {

  }
</style>
