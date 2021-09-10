<template>
  <div class="graph-layer-user-avatar">
    <img :src="blobUrl">
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";

  export default {
    name: "Avatar",

    mixins: [GraphLayerMixin],

    data: () => ({
      blobUrl: ""
    }),

    props: {
      endpoint: String
    },

    computed: {

    },

    created() {
      this.load();
    },

    methods: {
      load() {
        if (!this.endpoint) {
          return;
        }

        let endpoint = this.endpoint;
        endpoint += "/photo/$value";

        this.$fetchBlob(endpoint).then((value) => {
          this.setUrl(value);
        });
      },

      setUrl(data) {
        const url = window.URL || window.webkitURL;
        this.blobUrl = url.createObjectURL(data);
      }
    },

    watch: {
      endpoint() {
        this.load();
      }
    }
  };
</script>

<style scoped>
  .graph-layer-user-avatar {
    display: inline-flex;
    justify-content: center;
  }

  .graph-layer-user-avatar > img {
    border-radius: 50%;
    border: 1px solid var(--user-avatar-border-color);
    width: 100%;
    height: 100%;
    box-shadow: 0px 2px 12px 0px var(--user-avatar-shadow-color);
  }
</style>
