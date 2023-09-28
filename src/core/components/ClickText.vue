<template>
  <a :class="classes" :title="title" v-on:click.stop="onClick" @mousedown.prevent><slot></slot></a>
</template>

<script>
  export default {
    name: "ClickText",

    data: () => ({

    }),

    props: {
      disabled: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ""
      },
      accent: {
        type: Boolean,
        default: false
      }
    },

    computed: {
      classes() {
        const cls = [
          this.$style["click-text"]
        ];

        if (this.disabled) {
          cls.push(this.$style["disabled"]);
        }

        if (this.accent) {
          cls.push(this.$style['accent']);
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

        this.$emit("click",event);
      }
    }
  };
</script>

<style module>
  .click-text {
    font-size: 15px;
    cursor: pointer;
    user-select: none;
    color: var(--graph-layer-color-primary);
  }
  .click-text:hover {
    text-decoration: underline;
  }

  .click-text.accent {
    color: var(--graph-layer-color-accent);
    font-weight: bold;
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
