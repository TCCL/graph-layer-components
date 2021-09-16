<template>
  <div class="graph-layer-user-avatar">
    <img v-if="hasImage" :src="blobUrl">
    <div v-else class="initials">{{ initials }}</div>
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
      endpoint: String,
      displayName: String
    },

    computed: {
      hasImage() {
        return !!this.blobUrl;
      },

      initials() {
        if (!this.displayName) {
          return "?";
        }

        const parts = this.displayName.split(" ");
        if (parts.length == 0) {
          return "?";
        }

        let initials = "";
        if (parts.length >= 1) {
          initials += parts[0][0];
        }
        if (parts.length >= 2) {
          initials += parts[1][0];
        }

        return initials;
      }
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
        const prefix = "image";
        if (data.type.substring(0,prefix.length) != prefix) {
          this.blobUrl = null;
        }
        else {
          const url = window.URL || window.webkitURL;
          this.blobUrl = url.createObjectURL(data);
        }
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
    align-items: center;
    user-select: none;
    width: 96px;
    min-width: 96px;
    height: 96px;
    overflow: hidden;
    border-radius: 50%;
    border: 1px solid var(--graph-layer-user-avatar-border-color);
    box-shadow: 0px 2px 12px 0px var(--graph-layer-user-avatar-shadow-color);
    color: var(--graph-layer-user-avatar-color);
  }

  .graph-layer-user-avatar > img {
    width: 100%;
    height: 100%;
  }

  .graph-layer-user-avatar > .initials {
    font-size: 56px;
    font-weight: bold;
    letter-spacing: -0.05em;
  }
</style>
