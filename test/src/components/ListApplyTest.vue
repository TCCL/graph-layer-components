<template>
  <div class="graph-layer list-apply-test input-test">
    <div class="top-section">
      <div class="top-section__controls">
        <label for="input-serialized">Serialized List Value</label>
        <div class="top-section__input">
          <textarea id="input-serialized" v-model="serialized" placeholder="Enter serialized value"></textarea>
        </div>
      </div>

      <div class="top-section__button">
        <button v-if="!hasValue" @click="submit">Submit</button>
        <button v-else @click="reset">Reset</button>
      </div>
    </div>

    <graph-layer-list v-if="hasValue" :value="serialized" :top="top" />
  </div>
</template>

<script>
  export default {
    name: "ListApplyTest",

    data: () => ({
      serialized: "",
      submitted: false
    }),

    props: {
      top: {
        type: [String,Number],
        default: null
      }
    },

    computed: {
      hasValue() {
        return this.serialized && this.submitted;
      }
    },

    created() {

    },

    methods: {
      submit() {
        if (this.serialized) {
          this.submitted = true;
        }
      },

      reset() {
        this.submitted = false;
        this.serialized = true;
      }
    }
  };
</script>

<style scoped>
  .list-apply-test {
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
  .top-section__input > textarea {
    flex: 1;
    height: 5em;
  }
</style>
