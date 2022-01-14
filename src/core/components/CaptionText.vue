<script>
  export default {
    name: "CaptionText",
    functional: true,

    render(createElement,context) {
      const classes = [
        context.$style.caption,
        context.data.staticClass,
        context.data.class
      ];

      const options = {
        on: context.listeners,
        style: context.data.style,
        attrs: context.data.attrs,
        "class": classes
      };

      const el = context.props.block ? "div" : "span";

      return createElement(el,options,context.children);
    },

    props: {
      block: {
        type: Boolean,
        default: false
      }
    }
  };
</script>

<style module>
  .caption {
    color: var(--graph-layer-caption-color);
    font-size: 12px;
    font-weight: 400;
    letter-spacing: .02em;
    line-height: 17px;
  }
</style>
