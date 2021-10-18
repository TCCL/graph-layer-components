<template>
  <div class="graph-layer-wrapper scrollable-flex drive-input-test"> 
   <label>Select the kind of object and specify and ID:</label>
   <div class="controls">
      <select v-model="driveType">
        <option value="">-none selected-</option>
        <option value="id">Drive</option>
        <option value="siteId">Site</option>
        <option value="groupId">Group</option>
      </select>
      <input type="text" v-model="driveId" @keyup.enter="commit" />
      <button @click="commit">Render</button>
      <hr>
    </div>
    <graph-layer-drive v-if="ready" v-bind:[driveType]="driveId" />
  </div>
</template>

<script>
  export default {
    name: "DriveInputTest",

    data: () => ({
      driveType: "",
      driveId: "",
      commitFlag: false
    }),

    props: {

    },

    computed: {
      ready() {
        return this.driveType.length > 0
          && this.driveId.length > 0
          && this.commitFlag;
      }
    },

    created() {

    },

    methods: {
      commit() {
        this.commitFlag = true;
      }
    },

    watch: {
      driveId() {
        this.commitFlag = false;
      },
      driveType() {
        this.commitFlag = false;
      }
    }
  };
</script>

<style scoped>
  .controls {
    display: flex;
    justify-content: space-between;
  }

  .controls > select {
    flex: 1 0;
  }

  .controls > input {
    flex: 2 0;
  }
</style>
