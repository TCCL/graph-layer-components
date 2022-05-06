<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    :class="[$themeClass,$style['graph-layer-drive']]"
    >
    <div :class="$style['title-region']">
      <div v-if="canGoBack" :class="$style['back']" @click="goBack" title="Go back">
        <icon i="arrow-back" />
      </div>
      <h2 :class="$style['title-bar']">
        <span :class="$style['name']">{{ driveName }}</span>
        <span v-for="part in pathParts">/ {{ part }}</span>
      </h2>
      <div :class="$style['toolbar']">
        <icon
          button
          i="external-link"
          @click="openDrive"
          title="Open in Microsoft file viewer"
          />
      </div>
    </div>

    <div :class="$style['header']">
      <div :class="[$style['column'],$style['name']]">Name</div>
      <div :class="$style['column']">Size</div>
      <div :class="$style['column']">Last Modified By</div>
      <div :class="[$style['column'],$style['last-modified']]">Last Modified</div>
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
      value: {
        type: String,
        default: null
      },

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
      parsedValue() {
        if (this.value) {
          try {
            const repr = JSON.parse(this.value);
            return {
              driveType: repr.t,
              driveId: repr.i
            };

          } catch (err) {
            // break
          }
        }

        return {
          driveType: null,
          driveValue: null
        };
      },

      meValue() {
        if (this.string2boolean(this.me)) {
            return true;
        }

        if (this.parsedValue.driveType == "me") {
          return !!this.parsedValue.driveId;
        }

        return null;
      },

      userValue() {
        if (this.userIdOrPrincipleName) {
          return this.userIdOrPrincipleName;
        }

        if (this.parsedValue.driveType == "user") {
          return this.parsedValue.driveId;
        }

        return null;
      },

      groupValue() {
        if (this.groupId) {
          return this.groupId;
        }

        if (this.parsedValue.driveType == "group") {
          return this.parsedValue.driveId;
        }

        return null;
      },

      siteValue() {
        if (this.siteId) {
          return this.siteId;
        }

        if (this.parsedValue.driveType == "site") {
          return this.parsedValue.driveId;
        }

        return null;
      },

      driveValue() {
        if (this.id) {
          return this.id;
        }

        if (this.parsedValue.driveType == "drive") {
          return this.parsedValue.driveId;
        }

        return null;
      },

      endpoint() {
        if (this.meValue) {
          return "/me/drive";
        }

        if (this.userValue) {
          return "/users/" + this.userValue + "/drive";
        }

        if (this.siteValue) {
          return "/sites/" + this.siteValue + "/drive";
        }

        if (this.groupValue) {
          return "/groups/" + this.groupValue + "/drive";
        }

        if (this.driveValue) {
          return "/drives/" + this.driveValue;
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
          if (this.groupValue && (!this.driveInfo.owner || !this.driveInfo.owner.group)) {
            const uri = "/groups/" + this.groupValue;
            this.$fetchJson(uri,null,true).then((groupInfo) => {
              this.groupInfo = groupInfo;
            });
          }
        });

        // Fetch site info to use site display name.
        if (this.siteValue) {
          const uri = "/sites/" + this.siteValue;
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

<style module>
  .title-region {
    display: flex;
    align-items: center;
    border-bottom: 3px solid var(--graph-layer-divider-color);
    padding: 0.75em 0;
  }
  .title-region > .back {
    flex: 1 0;
    cursor: pointer;
    display: flex;
    justify-content: center;
  }
  .title-region > .back:hover {
    background-color: var(--graph-layer-drive-item-selected-background-color);
  }
  .title-region > .title-bar {
    margin: 0;
    flex: 10 0;
    font-weight: bold;
  }
  .title-region > .toolbar {
    flex: 1 0;
    text-align: right;
  }

  .header {
    display: flex;
    border-bottom: 2px solid var(--graph-layer-border-color);
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
