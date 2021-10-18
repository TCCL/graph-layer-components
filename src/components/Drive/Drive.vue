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
        <span class="name">{{ driveName }}</span>
        <span v-for="part in pathParts">/ {{ part }}</span>
      </div>
      <div class="toolbar">
        <icon
          i="external-link"
          class="button"
          @click="openDrive"
          title="Open in Microsoft file viewer"
          />
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
      @change="items = $event"
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
      items: [],
      siteInfo: null,
      groupInfo: null
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

      driveName() {
        let parts = [];

        if (this.siteInfo) {
          parts.push(this.siteInfo.displayName);
        }
        else if (this.groupInfo) {
          parts.push(this.groupInfo.displayName);
        }
        else if (this.driveInfo.owner && this.driveInfo.owner.group) {
          parts.push(this.driveInfo.owner.group.displayName);
        }
        else if (this.driveInfo.owner && this.driveInfo.owner.user) {
          parts.push(this.driveInfo.owner.user.displayName);
        }

        if (this.driveInfo.name) {
          parts.push(this.driveInfo.name);
        }

        return parts.join(" / ");
      },

      canGoBack() {
        return this.items.length > 0;
      },

      currentItem() {
        if (this.items.length > 0) {
          return this.items[this.items.length-1];
        }

        return this.driveInfo;
      },

      pathParts() {
        return this.items.map((item) => item.name);
      }
    },

    created() {
      this.load();
    },

    methods: {
      load() {
        this.driveInfo = {};
        this.groupInfo = null;
        this.siteInfo = null;

        this.$fetchJson(this.endpoint).then((driveInfo) => {
          this.driveInfo = driveInfo;

          // Fetch group info if we do not have group display name via 'owner'
          // property.
          if (this.groupId && (!this.driveInfo.owner || !this.driveInfo.owner.group)) {
            const uri = "/groups/" + this.groupId;
            this.$fetchJson(uri,null,true).then((groupInfo) => {
              this.groupInfo = groupInfo;
            });
          }
        });

        // Fetch site info to use site display name.
        if (this.siteId) {
          const uri = "/sites/" + this.siteId;
          this.$fetchJson(uri,null,true).then((siteInfo) => {
            this.siteInfo = siteInfo;
          });
        }
      },

      goBack() {
        this.$refs.explorer.goBack();
      },

      openDrive() {
        if (!this.currentItem.webUrl) {
          return;
        }

        window.open(this.currentItem.webUrl,"_blank");
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
    flex: 10 0;
  }
  .title-region > .toolbar {
    flex: 1 0;
    text-align: right;
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
