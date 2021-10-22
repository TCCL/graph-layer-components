<template>
  <a class="click-text" :class="classes" :title="title" v-on:click="onClick"><slot></slot></a>
</template>

<script>
  export default {
    name: 'ClickText',

    data: () => ({

    }),

    props: {
      disabled: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      }
    },

    computed: {
      classes() {
        var cls = [];

        if (this.disabled) {
          cls.push('disabled');
        }

        return cls;
      }
    },

    created() {

    },

    methods: {
      onClick(event) {
        if (this.disabled) {
          return;
        }

        this.$emit('click',event);
      }
    }
  };
</script>

<style scoped>
  .click-text {
    font-size: 15px;
    cursor: pointer;
    user-select: none;
  }
  .click-text:hover {
    text-decoration: underline;
  }

  .click-text.disabled {
    cursor: default;
    color: #ddd;
  }
  .click-text.disabled:hover {
    color: #ddd;
    text-decoration: none;
  }
</style>
