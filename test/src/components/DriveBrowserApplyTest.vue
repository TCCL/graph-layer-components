<template>
  <div class="graph-layer drive-browser-apply-test input-test">
    <div class="top-section">
      <div class="top-section__controls">
        <label for="input-drive-type">Drive Type</label>
        <div class="top-section__input">
          <input id="input-drive-type" type="text" v-model="driveType">
        </div>
        <label for="input-drive-id">Drive ID</label>
        <div class="top-section__input">
          <input id="input-drive-id" type="text" v-model="driveId">
        </div>
      </div>

      <div class="top-section__button">
        <button v-if="!hasValue" @click="submit">Submit</button>
        <button v-else @click="reset">Reset</button>
      </div>
    </div>

    <graph-layer-drive-browser v-if="hasValue" browse-followed-sites :value="driveValue" />
  </div>
</template>

<script>
  export default {
    name: "DriveBrowserApplyTest",

    data: () => ({
      driveType: "",
      driveId: "",
      submitted: false
    }),

    props: {

    },

    computed: {
      hasValue() {
        return this.driveType && this.driveId && this.submitted;
      },

      driveValue() {
        const value = {
          t: this.driveType,
          i: this.driveId
        };

        return JSON.stringify(value);
      }
    },

    created() {

    },

    methods: {
      submit() {
        if (this.driveType && this.driveId) {
          this.submitted = true;
        }
      },

      reset() {
        this.submitted = false;
        this.driveType = "";
        this.driveId = "";
      }
    }
  };
</script>

<style scoped>
  .drive-browser-apply-test {
    height: 100%;
  }
  .top-section {
    display: flex;
    margin-bottom: 2em;
    align-items: center;
    gap: 1em;
  }

  .top-section__controls {
    flex: 1;
  }

  .top-section__input {
    display: flex;
  }
  .top-section__input > input {
    flex: 1;
  }
</style>
