// mixins/StorageMixin.js

export default {
  data: () => ({
    storage: {
      type: "",
      id: ""
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

      const ks = this.$options.storageKeys;
      const repr = {};

      Object.keys(ks).forEach((key) => {
        if (this.storage[key]) {
          repr[ks[key]] = this.storage[key];
        }
      });

      return JSON.stringify(repr);
    },

    storageType() {
      return this.storage.type;
    },

    storageId() {
      return this.storage.id;
    }
  },

  created() {
    // Define base storage keys.
    this.$options.storageKeys = {
      type: "t",
      id: "i"
    };

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
    registerStorageKey(key,storedPropertyName,defaultValue) {
      this.$options.storageKeys[key] = storedPropertyName;
      this.$set(this.storage,key,defaultValue || "");
    },

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
