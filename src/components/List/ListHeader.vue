<template>
  <div :class="$style['list-header']">
    <div :class="$style['list-header__label']" :title="description">
      <h4
        :class="[$style['list-header__label-text'],
                 selected ? $style['list-header__label-text--selected'] : '']"
        @click="doSelect"
        >{{ title }}</h4>
    </div>

    <div
      :class="[$style['list-header__resizer'],tracking ? $style['list-header__resizer--tracking'] : '']"
      @mousedown="startTracking"></div>
  </div>
</template>

<script>
  const MIN_WIDTH = 100;
  const els = [];

  window.addEventListener("mousemove",(event) => {
    for (let i = 0;i < els.length;++i) {
      const el = els[i];
      if (el.tracking) {
        el.track(event);
      }
    }
  });

  window.addEventListener("mouseup",(event) => {
    for (let i = 0;i < els.length;++i) {
      const el = els[i];
      if (el.tracking) {
        el.stopTracking(event);
      }
    }
  });

  export default {
    name: "ListHeader",

    data: () => ({
      tracking: false
    }),

    props: {
      value: String,
      column: Object,
      selected: Boolean
    },

    computed: {
      title() {
        return this.column.displayName || this.column.name;
      },

      description() {
        return this.column.description || false;
      }
    },

    created() {

    },

    mounted() {
      els.push(this);
    },

    unmounted() {
      const index = els.indexOf(this);
      if (index >= 0) {
        els.splice(index,1);
      }
    },

    methods: {
      startTracking(event) {
        this.tracking = true;
      },

      track(event) {
        if (!this.tracking) {
          return;
        }

        const rect = this.$el.getBoundingClientRect();
        const delta = event.clientX - rect.x;

        if (delta < MIN_WIDTH) {
          this.$emit("input",MIN_WIDTH.toString() + "px");
        }
        else {
          this.$emit("input",delta.toString() + "px");
        }
      },

      stopTracking(event) {
        this.tracking = false;
      },

      doSelect(event) {
        if (!this.selected) {
          this.$emit("select");
        }
      }
    }
  };
</script>

<style module>
  .list-header {
    position: sticky;
    top: 0;
    background-color: var(--graph-layer-color-background);
    display: flex;
    align-items: flex-end;
  }

  .list-header__label {
    flex: 1;
    height: 2.5em;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    overflow: hidden;
  }
  .list-header__label:hover {
    background-color: var(--graph-layer-color-light-gray);
  }

  .list-header__label-text {
    margin: 0.25em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: pointer;
  }
  .list-header__label-text--selected {
    cursor: initial;
    color: var(--graph-layer-color-primary);
  }

  .list-header__resizer {
    position: relative;
    cursor: col-resize;
    padding: 1.25em 6px;
  }

  .list-header__resizer::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(50% - 1px);
    width: 1px;
    background-color: transparent;
  }
  .list-header__resizer:hover::after,
  .list-header__resizer--tracking::after {
    background-color: var(--graph-layer-border-color);
  }
</style>
