<script>
  import getIconSvg from "./manifest.js";

  export default {
    name: "Icon",
    functional: true,

    render(h,context) {
      const classes = [
          context.$style.icon,
          context.data.staticClass,
          context.data.class
      ];

      if (context.props.medium) {
        classes.push(context.$style.medium);
      }
      else if (context.props.large) {
        classes.push(context.$style.large);
      }
      else if (context.props.xlarge) {
        classes.push(context.$style.xlarge);
      }

      if (context.props.button) {
        classes.push(context.$style.button);
      }

      if (context.props.secondary) {
        classes.push(context.$style.secondary);
      }
      else if (context.props.accent) {
        classes.push(context.$style.accent);
      }
      else if (context.props.error) {
        classes.push(context.$style.error);
      }

      const e = h("i",{
        domProps: {
          innerHTML: getIconSvg(context.props.i)
        },

        "class": classes,
        attrs: context.data.attrs,
        style: context.data.style,
        on: context.listeners
      });

      return e;
    },

    props: {
      i: String,
      medium: {
        type: Boolean,
        value: false
      },
      large: {
        type: Boolean,
        value: false
      },
      xlarge: {
        type: Boolean,
        value: false
      },
      button: {
        type: Boolean,
        value: false
      },
      secondary: {
        type: Boolean,
        value: false
      },
      accent: {
        type: Boolean,
        value: false
      },
      error: {
        type: Boolean,
        value: false
      }
    }
  };
</script>

<style module>
  .icon {
    display: inline-block;
    width: 24px;
    height: 24px;
  }
  .icon.medium {
    width: 32px;
    height: 32px;
  }
  .icon.large {
    width: 48px;
    height: 48px;
  }
  .icon.xlarge {
    width: 96px;
    height: 96px;
  }

  .icon.button {
    cursor: pointer;
    opacity: 0.75;
  }
  .icon.button:hover {
    opacity: 1;
  }
  .icon.button:global(.disabled) {
    cursor: initial;
    opacity: 0.2;
    fill: var(--graph-layer-color-light-gray);
  }

  .icon > svg {
    fill: var(--graph-layer-color-primary);
  }
  .icon.secondary > svg {
    fill: var(--graph-layer-color-secondary);
  }
  .icon.accent > svg {
    fill: var(--graph-layer-color-accent);
  }
  .icon.error > svg {
    fill: var(--graph-layer-color-error);
  }
</style>
