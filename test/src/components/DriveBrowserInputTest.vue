<template>
  <div class="graph-layer input-test drive-browser-input-test">
    <div class="top-section">
      <input type="text" v-model="driveValue" readonly>
      <button v-if="!commit" @click="commit = true" :disabled="!hasValue">Render</button>
      <button v-else @click="reset">Clear</button>
    </div>

    <graph-layer-drive-browser v-show="!commit" v-model="driveValue" browse-me browse-users browse-groups />
    <graph-layer-drive v-if="commit" :value="driveValue" />
  </div>
</template>

<script>
  export default {
    name: "DriveBrowserInputTest",

    data: () => ({
      driveValue: "",
      commit: false
    }),

    props: {

    },

    computed: {
      hasValue() {
        return this.driveValue != "";
      }
    },

    created() {

    },

    methods: {
      reset() {
        this.driveValue = "";
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
