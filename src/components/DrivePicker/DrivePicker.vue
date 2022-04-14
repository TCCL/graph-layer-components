<template>
  <graph-layer-wrapper
    :class="[$themeClass,$style['graph-layer-drive-picker']]"
    >
    <div :class="$style['header']">
      <div :class="$style['title']">{{ title }}</div>
      <div :class="$style['filter-region']">
        <input
          v-model="filterText"
          v-show="selectedType"
          type="text"
          placeholder="Filter items..."
          >
      </div>
    </div>
    <input v-if="formElement" type="hidden" :name="formElement" :value="storageValue" />

    <graph-layer-wrapper scroll>
      <drive-tree-picker
        v-if="!usersOff"
        type="user"
        :value.sync="selectedValue"
        :active="selectedType == 'user'"
        :filter-text="filterTextDelayed"
        @select="selectPicker"
        />

      <drive-tree-picker
        v-if="!groupsOff"
        type="group"
        :value.sync="selectedValue"
        :active="selectedType == 'group'"
        :filter-text="filterTextDelayed"
        @select="selectPicker"
        />

      <drive-tree-picker
        v-if="!sitesOff"
        type="site"
        :value.sync="selectedValue"
        :active="selectedType == 'site'"
        :filter-text="filterTextDelayed"
        @select="selectPicker"
        />

      <drive-tree-picker
        v-if="!followedSitesOff"
        type="followedSite"
        :value.sync="selectedValue"
        :active="selectedType =='followedSite'"
        :filter-text="filterTextDelayed"
        @select="selectPicker"
        />
    </graph-layer-wrapper>
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import DriveTreePicker from "./DriveTreePicker.vue";

  export default {
    name: "GraphLayerDrivePicker",

    components: {
      DriveTreePicker
    },

    mixins: [
      GraphLayerMixin
    ],

    data: () => ({
      selectedType: "",
      parentId: "",
      driveType: "",
      driveId: "",

      filterText: "",
      filterTextDelayed: ""
    }),

    props: {
      title: {
        type: String,
        default: "Choose a document library"
      },

      value: {
        type: String,
        default: ""
      },

      usersOff: {
        type: [Boolean,String],
        default: false
      },

      groupsOff: {
        type: [Boolean,String],
        default: false
      },

      sitesOff: {
        type: [Boolean,String],
        default: false
      },

      followedSitesOff: {
        type: [Boolean,String],
        default: false
      },

      formElement: {
        type: String,
        default: ""
      }
    },

    computed: {
      storageValue() {
        if (this.selectedType == ""
            || this.driveType == ""
            || this.driveId == "")
        {
          return "";
        }

        const repr = {
          s: this.selectedType,
          p: this.parentId,
          t: this.driveType,
          i: this.driveId
        };

        return JSON.stringify(repr);
      },

      selectedValue: {
        get() {
          return {
            parentId: this.parentId,
            driveType: this.driveType,
            driveId: this.driveId
          };
        },
        set({ parentId, driveType, driveId }) {
          this.parentId = parentId || "";
          this.driveType = driveType;
          this.driveId = driveId;
        }
      }
    },

    created() {
      this.$options.filterTextCounter = 0;
      this.applyValue();
    },

    methods: {
      applyValue() {
        if (typeof this.value === "string" && this.value.length > 0) {
          try {
            const repr = JSON.parse(this.value);
            this.selectedType = repr.s;
            this.parentId = repr.p;
            this.driveType = repr.t;
            this.driveId = repr.i;
            return;

          } catch (err) {
            // break
          }
        }

        this.selectedType = "";
        this.parentId = "";
        this.driveType = "";
        this.driveId = "";
      },

      updateValue() {
        this.$emit("input",this.storageValue);
      },

      selectPicker(type) {
        if (this.selectedType == type) {
          this.selectedType = "";
        }
        else {
          this.selectedType = type;
        }
      }
    },

    watch: {
      selectedType(newType,oldType) {
        if (oldType) {
          this.parentId = "";
          this.driveType = "";
          this.driveId = "";
        }
      },

      storageValue() {
        this.updateValue();
      },

      filterText(value) {
        const id = ++this.$options.filterTextCounter;

        window.setTimeout(
          () => {
            if (id === this.$options.filterTextCounter) {
              this.filterTextDelayed = value;
            }
          },
          1500
        );
      }
    }
  };
</script>

<style module>
  .graph-layer-drive-picker {

  }

  .header {
    display: flex;
    border-bottom: 2px solid var(--graph-layer-drive-picker-heading-border-color);
    padding-bottom: 0.5em;
  }

  .header > .title {
    font-size: 1.5em;
    font-weight: bold;
  }

  .header > .filter-region {
    flex: 1;
    text-align: right;
  }
  .header > .filter-region > input {
    width: 90%;
    font-size: 18px;
    outline: none;
    padding: 4px;
    border: none;
    border-bottom: 2px solid var(--graph-layer-drive-picker-heading-border-color);
  }
  .header > .filter-region > input:focus {
    border-bottom: 2px solid var(--graph-layer-drive-picker-active-color);
  }
</style>
