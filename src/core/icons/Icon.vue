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

      if (context.props.disabled) {
        classes.push(context.$style.disabled);
      }

      let on = context.listeners;
      if (context.props.button) {
        on = Object.assign({},on || {});

        const mousedownOriginal = on.mousedown;
        on.mousedown = ($event) => {
          if (typeof mousedownOriginal === "function") {
            mousedownOriginal($event);
          }
          $event.preventDefault();
        };
      }

      const e = h("i",{
        domProps: {
          innerHTML: getIconSvg(context.props.i)
        },

        "class": classes,
        attrs: context.data.attrs,
        style: context.data.style,
        on
      });

      return e;
    },

    props: {
      i: String,
      medium: {
        type: Boolean,
        default: false
      },
      large: {
        type: Boolean,
        default: false
      },
      xlarge: {
        type: Boolean,
        default: false
      },
      button: {
        type: Boolean,
        default: false
      },
      secondary: {
        type: Boolean,
        default: false
      },
      accent: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      error: {
        type: Boolean,
        default: false
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
  .icon.button.disabled {
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
