<script>
  export default {
    name: "Portal",

    abstract: true,

    props: {
      parent: {
        type: null,
        validator (value) {
          if (HTMLElement && value && value instanceof HTMLElement) {
            return true
          }
          return false
        }
      }
    },

    mounted() {
      this.parent.appendChild(this.$el);
    },

    render(createElem) {
      const defaultSlot = this.$slots.default;

      if (defaultSlot && defaultSlot[0]) {
        return defaultSlot[0];
      }
    }
  };
</script>
