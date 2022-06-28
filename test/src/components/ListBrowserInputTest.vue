<template>
  <div class="graph-layer input-test list-browser-input-test">
    <div class="top-section">
      <input type="text" v-model="listValue" readonly>
      <button v-if="!commit" @click="commit = true" :disabled="!hasValue">Render</button>
      <button v-else @click="reset">Clear</button>
    </div>

    <graph-layer-list-browser
      v-show="!commit"
      v-model="listValue"
      :title="title"
      browse-sites
      browse-followed-sites
      :list-type="listType"
      :filter-template="filterTemplate"
      />

    <graph-layer-list v-if="commit" :value="listValue" :top="top" />
  </div>
</template>

<script>
  export default {
    name: "ListBrowserInputTest",

    data: () => ({
      listValue: "",
      commit: false
    }),

    props: {
      title: {
        type: String,
        default: ""
      },
      top: {
        type: [String,Number],
        default: null
      },
      listType: {
        type: String,
        default: "generic"
      },
      filterTemplate: {
        type: [Array,String],
        default: []
      }
    },

    computed: {
      hasValue() {
        return this.listValue != "" && this.listValue != "{}";
      }
    },

    created() {

    },

    methods: {
      reset() {
        this.listValue = "";
        this.commit = false;
      }
    }
  };
</script>

<style scoped>
  .top-section {
    display: flex;
    margin-bottom: 2em;
  }
  .top-section > input {
    flex: 3 0;
  }
  .top-section > button {
    flex: 1 0;
  }
</style>
