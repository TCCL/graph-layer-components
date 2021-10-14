<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    wrapper-class="no-scroll"
    class="graph-layer-drive"
    :class="[$themeClass]"
    >
    <div class="title-region">
      <div v-if="canGoBack" class="back" @click="goBack">
        <icon i="arrow-back" />
      </div>
      <div class="title-bar">
        <span class="name">{{ driveInfo.name }}</span>
        <span v-for="part in pathParts">/ {{ part }}</span>
      </div>
    </div>

    <div class="header">
      <div class="column name">Name</div>
      <div class="column">Size</div>
      <div class="column">Last Modified By</div>
      <div class="column last-modified">Last Modified</div>
    </div>

    <drive-explorer
      ref="explorer"
      :endpoint="endpoint"
      :top="top"
      @pathParts:update="pathParts = $event"
      />
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
  import DriveExplorer from "./DriveExplorer.vue";

  export default {
    name: "GraphLayerDrive",

    components: {
      DriveExplorer
    },

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      driveInfo: {},
      pathParts: []
    }),

    props: {
      id: {
        type: String,
        default: null
      },

      groupId: {
        type: String,
        default: null
      },

      siteId: {
        type: String,
        default: null
      },

      userIdOrPrincipleName: {
        type: String,
        default: null
      },

      me: {
        type: [Boolean,String],
        default: false
      },

      top: {
        type: [Number,String],
        default: null
      }
    },

    computed: {
      endpoint() {
        if (this.me) {
          return "/me/drive";
        }

        if (this.userIdOrPrincipleName) {
          return "/users/" + this.userIdOrPrincipleName + "/drive";
        }

        if (this.siteId) {
          return "/sites/" + this.siteId + "/drive";
        }

        if (this.groupId) {
          return "/groups/" + this.groupId + "/drive";
        }

        if (this.id) {
          return "/drives/" + this.id;
        }

        return null;
      },

      canGoBack() {
        return this.pathParts.length > 0;
      },
    },

    created() {
      this.load();
    },

    methods: {
      load() {
        this.$fetchJson(this.endpoint).then((driveInfo) => {
          this.driveInfo = driveInfo;
        });
      },

      goBack() {
        this.$refs.explorer.goBack();
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
  .title-region {
    display: flex;
    align-items: center;
    border-bottom: 3px solid var(--graph-layer-drive-divider-color);
    padding: 0.75em 0;
  }
  .title-region > .back {
    flex: 1 0;
    cursor: pointer;
    display: flex;
  }
  .title-region > .back:hover {
    background-color: var(--graph-layer-drive-item-selected-background-color);
  }
  .title-region > .title-bar {
    flex: 11 0;
  }

  .header {
    display: flex;
    border-bottom: 2px solid var(--graph-layer-drive-row-border-color);
  }
  .header > .column {
    font-size: 12px;
    font-weight: bold;
    padding: 0.5em 0;
    flex: 2 0;
  }
  .header > .column.name {
    flex: 6 0;
  }
  .header > .column.last-modified {
    text-align: right;
  }
</style>
