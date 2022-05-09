<template>
  <div :class="$style['list-header']">
    <div :class="$style.header">
      <h3 :class="$style.header__text">{{ title }}</h3>
    </div>

    <div
      :class="[$style.resizer,tracking ? $style['resizer--tracking'] : '']"
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
      column: Object
    },

    computed: {
      title() {
        return this.column.displayName || this.column.name;
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
      }
    }
  };
</script>

<style module>
  .list-header {
    display: flex;
    align-items: flex-end;
  }

  .header {
    flex: 1;
    height: 2.5em;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    overflow: hidden;
  }
  .header:hover {
    background-color: var(--graph-layer-color-light-gray);
  }

  .header__text {
    margin: 0.25em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .resizer {
    position: relative;
    cursor: col-resize;
    padding: 1.25em 6px;
  }

  .resizer::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(50% - 1px);
    width: 1px;
    background-color: transparent;
  }
  .resizer:hover::after,
  .resizer--tracking::after {
    background-color: var(--graph-layer-border-color);
  }
</style>
