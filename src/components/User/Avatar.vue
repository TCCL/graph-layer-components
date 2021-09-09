<template>
  <div class="graph-layer-user-avatar">
    <img :src="blobUrl">
  </div>
</template>

<script>
  import GraphLayerMixin from "../../mixins/GraphLayerMixin.js";

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

        this.$fetch(endpoint).then((response) => {

          return response.blob();
        }).then((value) => {
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

</style>
