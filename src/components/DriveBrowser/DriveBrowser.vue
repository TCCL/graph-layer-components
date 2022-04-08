<template>
  <graph-layer-wrapper
    :class="[$themeClass,$style['graph-layer-drive-browser']]"
   >
    <div :class="$style.header">
      <div :class="$style.header__title">
        <h2>{{ title }}</h2>
      </div>

      <div :class="$style.header__info">
        <div :class="$style.header__nav">
          <click-text
            v-if="nav.length > 0"
            :class="$style['header__nav-item']"
            @click="navigate({ id:'domain' })"
            >{{ domainLabel }}</click-text>

          <span
            v-else
            :class="[$style['header__nav-item'],$style['header__nav-item--active']]"
            >{{ domainLabel }}</span>

          <template v-for="item,index in nav">
            <click-text
              v-if="index < nav.length-1"
              :key="item.id"
              :class="$style['header__nav-item']"
              @click="navigate(item)"
              >{{ item.label }}</click-text>
            <span
              v-else
              :key="item.id"
              :class="[$style['header__nav-item'],$style['header__nav-item--active']]"
              >{{ item.label }}</span>
          </template>
        </div>

        <div v-if="hasSelection" :class="$style['header__selected']">
          <span :class="$style['header__selected-label']">{{ selectedItem.label }}</span>
          <icon
            button
            i="external-link"
            @click="openDrive"
            title="Open in Microsoft file viewer"
            />
        </div>
      </div>
    </div>

    <input v-if="formElement" type="hidden" :name="formElement" :value="storageValue" />

    <drive-browser-explorer
      ref="explorer"
      v-model="selection"
      :items="topLevelItems"
      @nav="nav = $event"
      />
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  import DriveBrowserExplorer from "./DriveBrowserExplorer.vue";

  export default {
    name: "GraphLayerDriveBrowser",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    components: {
      DriveBrowserExplorer
    },

    data: () => ({
      driveType: "",
      driveId: "",
      selectedItem: null,
      selectedNav: null,

      nav: []
    }),

    props: {
      domainLabel: {
        type: String,
        default: "My Organization"
      },

      title: {
        type: String,
        default: "Select a document library"
      },

      formElement: {
        type: String,
        default: ""
      },

      value: {
        type: String,
        default: ""
      },

      browseMe: {
        type: [Boolean,String],
        default: false
      },

      browseUsers: {
        type: [Boolean,String],
        default: false
      },

      browseGroups: {
        type: [Boolean,String],
        default: false
      },

      browseSites: {
        type: [Boolean,String],
        default: false
      }
    },

    computed: {
      topLevelItems() {
        const items = [];

        if (this.browseMe) {
          items.push({
            id: "toplv-me",
            type: "toplv",
            label: "My Documents",
            endpoint: "/me/drives",
            schema: "driveList"
          });
        }

        if (this.browseUsers) {
          items.push({
            id: "toplv-users",
            type: "toplv",
            label: "Users",
            endpoint: "/users",
            params: {
              "$orderby": "displayName",
              "$select": "id,displayName,jobTitle,userType"
            },
            schema: "userList"
          });
        }

        if (this.browseGroups) {
          items.push({
            id: "toplv-groups",
            type: "toplv",
            label: "Groups",
            endpoint: "/groups",
            params: {
              "$orderby": "displayName",
              "$select": "id,displayName,description"
            },
            schema: "groupList"
          });
        }

        if (this.browseSites) {
          items.push({
            id: "toplv-groups",
            type: "toplv",
            label: "Sites",
            endpoint: "/sites",
            params: {
              "search": "*",
              "$select": "id,displayName,description"
            },
            schema: "siteList"
          });
        }

        return items;
      },

      selection: {
        get() {
          return {
            driveType: this.driveType,
            driveId: this.driveId,
            item: this.selectedItem
          };
        },
        set({ driveType, driveId, item }) {
          this.driveType = driveType || "";
          this.driveId = driveId || "";
          this.selectedItem = item || null;
          if (item) {
            this.selectedNav = this.nav.slice();
          }
          else {
            this.selectedNav.splice(0);
          }
        }
      },

      storageValue() {
        if (this.driveType == "" || this.driveId == "") {
          return "";
        }

        const repr = {
          t: this.driveType,
          i: this.driveId
        };

        return JSON.stringify(repr);
      },

      hasSelection() {
        return this.selectedItem !== null;
      }
    },

    created() {

    },

    methods: {
      navigate(item) {
        this.$refs.explorer.navigate(item.id);
      },

      openDrive() {
        if (!this.selectedItem) {
          return;
        }

        window.open(this.selectedItem.webUrl,"_blank");
      }
    }
  };
</script>

<style module>
  .graph-layer-drive-browser {

  }

  .header {
    border-bottom: 3px solid var(--graph-layer-drive-browser-divider-color);
    padding: 0.75em 0;
  }

  .header__title {
    display: flex;
  }

  .header__info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .header__nav {
    padding: 0.25em 0;
  }

  .header__nav-item {
    padding: 0.5em;
    border-right: 3px solid var(--graph-layer-drive-browser-divider-color);
  }

  .header__nav-item:last-child {
    border-right: none;
  }

  .header__nav-item--active {
    font-weight: bold;
  }

  .header__selected {
    display: flex;
    align-items: center;
    gap: 0.25em;
  }

  .header__selected-label {
    font-size: 0.9em;
    font-weight: bold;
  }
</style>
