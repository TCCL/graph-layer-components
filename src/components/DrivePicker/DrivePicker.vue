<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    class="graph-layer-drive-picker"
    :class="[$themeClass]"
    scroll
    >
    <drive-tree-picker
      v-if="!usersOff"
      class="user"
      type="user"
      :value.sync="selectedValue"
      :active="selectedType == 'user'"
      @select="selectPicker"
      />

    <drive-tree-picker
      v-if="!groupsOff"
      class="group"
      type="group"
      :value.sync="selectedValue"
      :active="selectedType == 'group'"
      @select="selectPicker"
      />

    <drive-tree-picker
      v-if="!sitesOff"
      class="site"
      type="site"
      :value.sync="selectedValue"
      :active="selectedType == 'site'"
      @select="selectPicker"
      />

    <input v-if="formElement" type="hidden" :name="formElement" :value="storageValue" />
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
      driveId: ""
    }),

    props: {
      value: {
        type: String,
        default: ""
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
      }
    }
  };
</script>

<style scoped>
  .drive-tree-picker {
    flex: 0 0;
  }
</style>
