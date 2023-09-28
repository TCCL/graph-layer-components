<script>
  import getIconSvg from "./manifest.js";

  export default {
    name: "Icon",

    render(h,context) {
      const classes = [
          this.$style.icon,
      ];

      if (this.medium) {
        classes.push(this.$style.medium);
      }
      else if (this.large) {
        classes.push(this.$style.large);
      }
      else if (this.xlarge) {
        classes.push(this.$style.xlarge);
      }

      if (this.button) {
        classes.push(this.$style.button);
      }

      if (this.secondary) {
        classes.push(this.$style.secondary);
      }
      else if (this.accent) {
        classes.push(this.$style.accent);
      }
      else if (this.error) {
        classes.push(this.$style.error);
      }

      if (this.disabled) {
        classes.push(this.$style.disabled);
      }

      let on;
      if (this.disabled) {
        on = null;
      }
      else {
        on = this.$listeners;
        if (this.button) {
          on = Object.assign({},on || {});

          const mousedownOriginal = on.mousedown;
          on.mousedown = ($event) => {
            if (typeof mousedownOriginal === "function") {
              mousedownOriginal($event);
            }
            $event.preventDefault();
          };
        }
      }

      const e = h("i",{
        domProps: {
          innerHTML: getIconSvg(this.i)
        },

        "class": classes,
        attrs: this.$attrs,
        style: this.$style,
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
