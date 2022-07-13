<template>
  <div :class="[$style['list-browser-events-config-widget'],'graph-layer']">
    <div :class="$style['help-text']">Select the list columns to use for rendering the events calendar.</div>

    <div v-for="prop in properties" :class="$style['mapping-entry']">
      <div :class="$style['mapping-entry__label']">{{ prop.label }}</div>
      <select v-model="mapping[prop.key]" :class="$style['mapping-entry__select']">
        <option v-for="opt in options" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  const DEFAULT_MAPPING = {
    "title": "Title",
    "startDate": "EventDate",
    "endDate": "EndDate",
    "description": "Description",
    "createdBy": "Author"
  };

  export default {
    name: "ListBrowserEventsConfigWidget",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      columns: [],
      mapping: {}
    }),

    props: {
      value: Object,
      listId: String,
      siteId: String
    },

    computed: {
      endpoint() {
        return "/sites/" + this.siteId + "/lists/" + this.listId + "/columns";
      },

      properties() {
        return [
          { key:"title", label:"Event Title" },
          { key:"startDate", label:"Event Start Date" },
          { key:"endDate", label:"Event End Date" },
          { key:"description", label:"Event Description" },
          { key:"createdBy", label:"Event Created By" }
        ];
      },

      options() {
        const options = [];
        for (let i = 0;i < this.columns.length;++i) {
          const col = this.columns[i];
          options.push({
            value: col.info.name,
            label: col.info.displayName
          });
        }
        return options;
      },

      isDefault() {
        for (const key in DEFAULT_MAPPING) {
          if (this.mapping[key] != DEFAULT_MAPPING[key]) {
            return false;
          }
        }
        return true;
      }
    },

    created() {
      this.load();
    },

    methods: {
      load() {
        this.$fetchJson(this.endpoint).then((result) => {
          const { value: cols } = result;

          this.columns.splice(0);
          for (let i = 0;i < cols.length;++i) {
            this.columns.push({
              info: cols[i]
            });
          }

          // Dedup display names so we can show columns unambiguously.
          const displayNames = new Map();
          const map = new Map();
          for (let i = 0;i < this.columns.length;++i) {
            const col = this.columns[i];
            col.selected = false;
            map.set(col.info.id,col);
            map.set(col.info.name,col);

            const dn = col.info.displayName;
            if (displayNames.has(dn)) {
              displayNames.get(dn).push(col);
            }
            else {
              displayNames.set(dn,[col]);
            }
          }
          for (const value of displayNames.values()) {
            if (value.length > 1) {
              for (let i = 0;i < value.length;++i) {
                value[i].info.displayName = value[i].info.displayName
                  + " (" + value[i].info.name + ")";
              }
            }
          }

          this.sync();
        });
      },

      sync() {
        // Apply value to mapping. A value of 'null' is interpreted as default.
        if (!this.value) {
          this.mapping = Object.assign({},DEFAULT_MAPPING);
        }
        else {
          this.mapping = Object.assign({},DEFAULT_MAPPING,this.value);

          // Correct any mappings that do not refer to valid columns with the
          // default assignment.
          const nameSet = new Set(this.columns.map(({ info }) => info.name));
          const keys = Object.keys(DEFAULT_MAPPING);
          for (let i = 0;i < keys.length;++i) {
            const k = keys[i];
            if (!nameSet.has(this.mapping[k])) {
              this.mapping[k] = DEFAULT_MAPPING[k];
            }
          }
        }
      }
    },

    watch: {
      endpoint() {
        this.load();
      },

      value(newValue) {
        if (newValue === this.mapping || (newValue === null && this.isDefault)) {
          return;
        }

        this.sync();
      },

      mapping: {
        deep: true,
        handler() {
          if (this.isDefault) {
            this.$emit("input",null);
          }
          else {
            this.$emit("input",this.mapping);
          }
        }
      }
    }
  };
</script>

<style module>
  .list-browser-events-config-widget {

  }

  .help-text {
    margin: 0.75em;
    font-size: 1.15em;
  }

  .mapping-entry {
    display: flex;
    gap: 1.5em;
    padding-bottom: 0.25em;
    margin-bottom: 0.25em;
    border-bottom: 1px solid var(--graph-layer-color-secondary);
  }

  .mapping-entry__label {
    flex: 2;
    font-size: 1.25em;
    font-weight: bold;
    text-align: right;
  }

  .mapping-entry__select {
    flex: 1;
  }
</style>
