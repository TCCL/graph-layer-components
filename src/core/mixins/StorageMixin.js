// mixins/StorageMixin.js

export default {
  data: () => ({
    storage: {
      type: "",
      id: "",
      parentId: ""
    }
  }),

  props: {
    value: {
      type: String,
      default: ""
    }
  },

  computed: {
    storageValue() {
      if (!this.storage.type || !this.storage.id) {
        return "{}";
      }

      const repr = {
        t: this.storage.type,
        i: this.storage.id
      };

      if (this.storage.parentId) {
        repr.p = this.storage.parentId;
      }

      return JSON.stringify(repr);
    },
  },

  created() {
    // Parse value and pass it to applyValue() method if it exists.
    if (typeof this.applyValue === "function"
        && typeof this.value === "string"
        && this.value.length > 0)
    {
      try {
        const repr = JSON.parse(this.value);
        this.applyValue(repr);
      } catch (ex) {
        this.applyValue(false);
      }
    }
  },

  methods: {
    updateStorageValue() {
      this.$emit("input",this.storageValue);
    }
  },

  watch: {
    storageValue() {
      this.updateStorageValue();
    }
  }
};
