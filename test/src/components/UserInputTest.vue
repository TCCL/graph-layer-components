<template>
  <div class="graph-layer input-test user-input-test">
    <div class="controls">
      <label>Enter the <code>userPrincipleName</code>:</label>
      <input type="text" v-model="inputValue" @keyup.enter="commit" />
      <button @click="commit">Render</button>
      <hr>
    </div>
    <graph-layer-user v-if="ready" :user-principle-name="userPrincipleName" />
  </div>
</template>

<script>
  export default {
    name: "UserInputTest",

    data: () => ({
      inputValue: "",
      userPrincipleName: ""
    }),

    props: {

    },

    computed: {
      ready() {
        return this.userPrincipleName.length > 0;
      }
    },

    created() {

    },

    methods: {
      commit() {
        if (this.inputValue) {
          this.userPrincipleName = this.inputValue;
        }
        else {
          this.userPrincipleName = "";
        }
      }
    }
  };
</script>

<style scoped>
  .user-input-test > .controls > input {
    width: 25em;
  }
</style>
