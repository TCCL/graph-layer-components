<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    class="graph-layer-drive-picker"
    :class="[$themeClass]"
    >
    <div class="title-bar">
      <span>Select a drive</span>
    </div>

    
    <drive-tree-picker
      v-if="!meOff"
      class="me"
      type="me"
      :id.sync="ids.me"
      :active="driveType == 'me'"
      @select="selectPicker"
      />

    <drive-tree-picker
      v-if="!usersOff"
      class="user"
      type="user"
      :id.sync="ids.user"
      :active="driveType == 'user'"
      @select="selectPicker"
      />

    <drive-tree-picker
      v-if="!groupsOff"
      class="group"
      type="group"
      :id.sync="ids.site"
      :active="driveType == 'group'"
      @select="selectPicker"
      />

    <drive-tree-picker
      v-if="!sitesOff"
      class="site"
      type="site"
      :id.sync="ids.site"
      :active="driveType == 'site'"
      @select="selectPicker"
      />

    <input v-if="formElement" type="hidden" :name="formElement" :value="storageValue" />
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
  import DriveTreePicker from "./DriveTreePicker.vue";

  function driveType2PropName(driveType) {
    switch (driveType) {
    case "me":
      return "me";

    case "group":
      return "groupId";

    case "site":
      return "siteId";

    case "user":
      return "userIdOrPrincipleName";
    }

    throw Error("Invalid drive type");
  }

  export default {
    name: "GraphLayerDrivePicker",

    components: {
      DriveTreePicker
    },

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      driveType: "",

      ids: {
        id: null,
        me: null,
        user: null,
        group: null,
        site: null
      }
    }),

    props: {
      // Returns the drive ID string or { key, value } object.
      value: {
        type: [String, Object],
        default: ""
      },

      meOff: {
        type: Boolean,
        default: false
      },

      usersOff: {
        type: Boolean,
        default: false
      },

      groupsOff: {
        type: Boolean,
        default: false
      },

      sitesOff: {
        type: Boolean,
        default: false
      },

      formElement: {
        type: String,
        default: ""
      }
    },

    computed: {
      id() {
        switch (this.driveType) {
          // Special case: 'me' resource is a Boolean toggle.
        case "me":
          return this.ids.me ? "1" : "0";

        case "user":
          return this.ids.user;
        case "group":
          return this.ids.group;
        case "site":
          return this.ids.site;
        }

        return this.ids.id;
      },

      storageValue() {
        if (this.driveType != "" && this.driveType != "id") {
          return driveType2PropName(this.driveType) + ":" + this.id;
        }

        return this.ids.id;
      }
    },

    created() {

    },

    methods: {
      selectPicker(type) {
        if (this.driveType == type) {
          this.driveType = "";
        }
        else {
          this.driveType = type;
        }
      }
    }
  };
</script>

<style scoped>
  .title-bar {
    font-weight: bold;
    font-size: 1.5em;
  }

  .drive-tree-picker {
    flex: 0 0;
  }
  .drive-tree-picker.active {
    flex: 1 0;
  }
</style>
