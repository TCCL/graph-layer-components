<script>
  import getIconSvg from "./manifest.js";

  export default {
    name: "Icon",
    functional: true,

    render(h,context) {
      const e = h("i",{
        domProps: {
          innerHTML: getIconSvg(context.props.i)
        },

        "class": [
          "icon",
          context.data.staticClass,
          context.data.class
        ],

        attrs: context.data.attrs,
        style: context.data.style,
        on: context.listeners
      });

      return e;
    },

    props: {
      i: String
    }
  };
</script>

<style scoped>
  .icon {
    display: inline-block;
    width: 24px;
    height: 24px;
  }

  .icon.button {
    cursor: pointer;
    opacity: 0.9;
  }
  .icon.button:hover {
    opacity: 1;
  }
  .icon.button.disabled {
    cursor: initial;
    opacity: 0.2;
    fill: var(--graph-layer-color-light-gray);
  }

  .icon >>> svg {
    fill: var(--graph-layer-color-primary);
  }
  .icon.secondary >>> svg {
    fill: var(--graph-layer-color-secondary);
  }
  .icon.accent >>> svg {
    fill: var(--graph-layer-color-accent);
  }
</style>
