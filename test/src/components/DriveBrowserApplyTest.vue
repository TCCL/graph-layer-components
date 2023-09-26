<template>
  <div class="graph-layer drive-browser-apply-test input-test">
    <div class="top-section">
      <div class="top-section__controls">
        <label for="input-serialized">Serialized Drive Browser Value</label>
        <div class="top-section__input">
          <textarea id="input-serialized" v-model="serialized" placeholder="Enter serialized value"></textarea>
        </div>
      </div>

      <div class="top-section__button">
        <button v-if="!hasValue" @click="submit">Submit</button>
        <button v-else @click="reset">Reset</button>
      </div>
    </div>

    <graph-layer-drive-browser
      v-if="hasValue"
      v-model="applyValue"
      :title="title"
      browse-followed-sites
      />
  </div>
</template>

<script>
  export default {
    name: "DriveBrowserApplyTest",

    data: () => ({
      serialized: "",
      submitted: false
    }),

    props: {
      title: {
        type: String,
        default: ""
      },
      filterTemplate: {
        type: [Array,String],
        default: () => ([])
      }
    },

    computed: {
      hasValue() {
        return this.serialized && this.submitted;
      },

      applyValue: {
        get() {
          return this.serialized;
        },
        set(value) {
          try {
            const un = JSON.parse(value);
            this.serialized = JSON.stringify(un,null,"  ");
          }
          catch (err) {
            this.serialized = value;
          }
        }
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
  .top-section__input > textarea {
    flex: 1;
    height: 5em;
  }
</style>
