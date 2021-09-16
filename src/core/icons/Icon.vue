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
        style: context.data.style
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
