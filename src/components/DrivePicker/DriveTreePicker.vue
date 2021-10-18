<template>
  <div
    class="drive-tree-picker scrollable-flex"
    :class="classes"
    >
    <div class="header" @click="select">
      <icon :i="active ? 'arrow-down' : 'arrow-right'" />

      <span v-if="isMe">My Drives</span>
      <span v-else-if="isUser">User Drives</span>
      <span v-else-if="isGroup">Group Drives</span>
      <span v-else-if="isSite">Site Drives</span>
    </div>

    <graph-layer-wrapper
      v-show="active"
      :loading-state="$loadingState"
      :error-state="$errorState"
      class="graph-layer-drive-tree-picker-inner"
      >
      Stuff

    </graph-layer-wrapper>
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  export default {
    name: "DriveTreePicker",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({

    }),

    props: {
      type: String,
      id: String,
      active: Boolean
    },

    computed: {
      isMe() {
        return this.type == 'me';
      },

      isUser() {
        return this.type == 'user';
      },

      isGroup() {
        return this.type == 'group';
      },

      isSite() {
        return this.type == 'site';
      },

      classes() {
        const cls = [];

        cls.push(this.$themeClass);
        if (this.active) {
          cls.push("active");
        }

        return cls;
      }
    },

    created() {

    },

    methods: {
      select() {
        this.$emit('select',this.type);
      }
    }
  };
</script>

<style scoped>
  .drive-tree-picker {

  }

  .drive-tree-picker > .header {
    flex: 0 0;
    padding: 1.5em 1em;
    cursor: pointer;
  }
  .drive-tree-picker > .header:hover {
    background-color: var(--graph-layer-drive-selected-background-color);
  }
</style>
