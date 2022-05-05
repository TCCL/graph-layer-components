<template>
  <div class="graph-layer input-test list-browser-input-test">
    <div class="top-section">
      <input type="text" v-model="listValue" readonly>
      <button v-if="!commit" @click="commit = true" :disabled="!hasValue">Render</button>
      <button v-else @click="reset">Clear</button>
    </div>

    <graph-layer-list-browser v-show="!commit" v-model="listValue" browse-sites="0" browse-followed-sites  />
    <graph-layer-list v-if="commit" :value="listValue" />
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

    },

    computed: {
      hasValue() {
        return this.listValue != "";
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
