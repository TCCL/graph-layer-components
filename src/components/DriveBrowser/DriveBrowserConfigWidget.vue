<template>
  <div :class="[$style['drive-browser-config-widget'],'graph-layer']">
    <div :class="$style['header']">Configure options for rendering document library:</div>

    <div :class="$style['config-section']">
      <div :class="$style['config-section__title']">Select the default sort-by field:</div>

      <div :class="$style['select-option-list']">
        <div
          v-for="opt in sortByOptions"
          @click="form.sortBy = opt.value"
          :class="[$style['select-option'],opt.selected ? $style['select-option--selected'] : '']"
          >{{ opt.label }}</div>
      </div>
    </div>

    <div :class="$style['config-section']">
      <div :class="$style['config-section__title']">Select the default sort direction:</div>

      <div :class="$style['select-option-list']">
        <div
          v-for="opt in ascOptions"
          @click="form.asc = form.sortBy ? opt.value : true"
          :class="[$style['select-option'],opt.selected ? $style['select-option--selected'] : '']"
          >{{ opt.label }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export const DEFAULT_CONFIG_VALUE = {
    sortBy: "",
    asc: true
  };

  export default {
    name: "DriveBrowserConfigWidget",

    data: () => ({
      form: {
        sortBy: null,
        asc: null
      },

      sortByOptions: [
        { value:"name", label:"Name", selected:false },
        { value:"size", label:"Size", selected:false },
        { value:"lastModifiedBy.user.displayName", label:"Last Modified By", selected:false },
        { value:"lastModifiedDateTime", label:"Last Modified Time", selected:false }
      ],

      ascOptions: [
        { value:true, label:"Ascending", selected:false },
        { value:false, label:"Descending", selected:false }
      ]
    }),

    props: {
      value: Object
    },

    computed: {

    },

    created() {
      this.applyValue(this.value || DEFAULT_CONFIG_VALUE);
    },

    methods: {
      applyValue(val) {
        if (val && val !== this.form) {
          this.form = Object.assign({},val);
        }
      }
    },

    watch: {
      value(val) {
        this.applyValue(val);
      },

      form: {
        deep: true,
        handler() {
          this.sortByOptions.forEach((opt) => {
            opt.selected = ( opt.value == this.form.sortBy );
          });
          this.ascOptions.forEach((opt) => {
            opt.selected = ( opt.value == this.form.asc && this.form.sortBy );
          });

          if (this.isDefault) {
            this.$emit("input",null);
          }
          else {
            this.$emit("input",this.form);
          }
        }
      }
    }
  };
</script>

<style module>
  .drive-browser-config-widget {
    overflow: hidden;
    justify-content: center;
    gap: 1.75em;
  }

  .header {
    margin: 0.75em;
    font-size: 1.15em;
  }

  .config-section {
    margin-left: 1em;
  }

  .config-section__title {
    font-weight: bold;
    margin-bottom: 0.25em;
  }

  .select-option-list {
    display: flex;
    gap: 1.5em;
    justify-content: flex-start;
  }

  .select-option {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0.75em;
    border: 1px solid var(--graph-layer-color-secondary);
  }
  .select-option.select-option--selected {
    background-color: var(--graph-layer-color-primary);
    font-weight: bold;
    font-size: 1.15em;
  }
  .select-option:hover {
    background-color: var(--graph-layer-color-primary);
    opacity: 0.33;
  }
</style>
