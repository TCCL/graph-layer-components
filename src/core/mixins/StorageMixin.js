// mixins/StorageMixin.js

export default {
  data: () => ({
    storage: {},
    storageList: []
  }),

  props: {
    value: {
      type: String,
      default: ""
    }
  },

  computed: {
    storageTop() {
      return this.storageList[0];
    },

    storageValue() {
      const repr = this.makeStorageRepr(this.storageTop,this.storageList.slice(1));
      return JSON.stringify(repr);
    },

    storageType() {
      return this.storageTop.type;
    },

    storageId() {
      return this.storageTop.id;
    }
  },

  created() {
    // Set up initial storage top.
    this.storageList.push(this.storage);

    // Define base storage keys.
    this.$options.storageKeys = {};
    this.registerStorageKey("type","t");
    this.registerStorageKey("id","i");

    // Parse value and pass it to applyValue() method if it exists.
    if (typeof this.applyValue === "function"
        && typeof this.value === "string"
        && this.value.length > 0)
    {
      let repr;
      try {
        repr = JSON.parse(this.value);
      } catch (ex) {
        this.applyValue(false);
        return;
      }

      let index = 0;
      this.applyValue(repr,index++);

      // Apply secondary storage items.
      if (Array.isArray(repr._)) {
        repr._.forEach((item) => {
          this.applyValue(item,index++);
        });
      }
    }
  },

  methods: {
    registerStorageKey(key,storedPropertyName,defaultValue) {
      this.$options.storageKeys[key] = [
        storedPropertyName,
        defaultValue,
        JSON.stringify(defaultValue)
      ];

      let assignValue;
      if (typeof defaultValue !== "undefined") {
        assignValue = defaultValue;
      }
      else {
        assignValue = "";
      }
      this.$set(this.storage,key,assignValue);
    },

    setUpStorage(value) {
      const keys = Object.keys(this.$options.storageKeys);
      for (let i = 0;i < keys.length;++i) {
        const key = keys[i];
        this.$set(value,key,this.$options.storageKeys[key][1]);
      }
    },

    makeStorageRepr(storage,secondary) {
      if (!storage || !storage.type || !storage.id) {
        return {};
      }

      const ks = this.$options.storageKeys;
      const repr = {};

      Object.keys(ks).forEach((key) => {
        const value = storage[key];
        if (value === undefined && defaultValueSerialized === undefined) {
          throw Error(`Storage property ${key} is required`);
        }

        const [ prop, defaultValue, defaultValueSerialized ] = ks[key];
        if (defaultValueSerialized === undefined
          || JSON.stringify(storage[key]) != defaultValueSerialized)
        {
          repr[prop] = value;
        }
      });

      if (secondary && secondary.length > 0) {
        repr['_'] = secondary.map((stor) => this.makeStorageRepr(stor));
      }

      return repr;
    },

    getStorageAtIndex(index) {
      if (index < 0 || index >= this.storageList.length) {
        return null;
      }
      return this.storageList[index];
    },

    pushStorage(preventUpdate) {
      const newStorage = {};
      this.setUpStorage(newStorage);
      this.storageList.push(newStorage);
      if (!preventUpdate) {
        this.storage = newStorage;
      }
      return newStorage;
    },

    selectStorage(index) {
      if (index < 0 || index >= this.storageList.length) {
        return;
      }

      this.storage = this.storageList[index];
    },

    removeStorage(index) {
      if (index < 0 || index >= this.storageList.length || this.storageList.length < 2) {
        return;
      }

      this.storageList.splice(index,1);
      if (index >= this.storageList.length) {
        index = this.storageList.length - 1;
      }
      this.selectStorage(index);

      return index;
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
