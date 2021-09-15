<script>
  import getIconSvg from "./manifest.js";

  export default {
    name: "Icon",

    render(h) {
      const e = h("i",{
        domProps: {
          innerHTML: getIconSvg(this.$props.i)
        },

        "class": "icon"
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
  }

  .icon >>> svg {
    fill: var(--icon-color);
  }
</style>
