<template>
  <graph-layer-wrapper
    :class="[$themeClass,$style['graph-layer-generic-browser']]"
   >
    <div :class="$style.header">
      <div :class="$style.header__title">
        <h2>{{ title }}</h2>
      </div>

      <div :class="$style.header__info">
        <div :class="$style.header__nav">
          <click-text
            v-if="nav.length > 0"
            :class="$style['header__nav-item']"
            @click="navigate({ id:'domain' })"
            >{{ domainLabel }}</click-text>

          <span
            v-else
            :class="[$style['header__nav-item'],$style['header__nav-item--active']]"
            >{{ domainLabel }}</span>

          <template v-for="item,index in nav">
            <click-text
              v-if="index < nav.length-1"
              :key="item.id"
              :class="$style['header__nav-item']"
              @click="navigate(item)"
              >{{ item.label }}</click-text>
            <span
              v-else
              :key="item.id"
              :class="[$style['header__nav-item'],$style['header__nav-item--active']]"
              >{{ item.label }}</span>
          </template>
        </div>

        <div v-if="hasSelection" :class="$style['header__selected']">
          <span :class="$style['header__selected-label']">{{ selectedItem.label }}</span>
          <icon
            v-if="selectedItem.webUrl"
            button
            i="external-link"
            @click="openItem"
            title="Open in Microsoft portal"
            />
        </div>
      </div>
    </div>

    <div v-if="$slots.header" :class="$style['user-header']">
      <slot name="header"></slot>
    </div>

    <generic-browser-explorer
      ref="explorer"
      v-model="selection"
      :target-schema="targetSchema"
      :schema-processing="schemaProcessing"
      :items="items"
      @nav="nav = $event"
      />

    <slot></slot>

    <div v-if="$slots.options" v-show="nav.length == 0" :class="$style.options">
      <div :class="[$style.options__menu,toggleOptions ? $style['options__menu--toggled'] : '']">
        <click-text
          @click="toggleOptions = !toggleOptions"
          >Manual Options<icon
                          :class="$style['options__toggle-icon']"
                          :i="toggleOptions ? 'arrow-right' : 'arrow-down'" /></click-text>
      </div>

      <slot v-if="toggleOptions" name="options"></slot>
    </div>

    <div v-if="$slots.footer" :class="$style['user-footer']">
      <slot name="footer"></slot>
    </div>
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";

  import GenericBrowserExplorer from "./GenericBrowserExplorer.vue";

  export default {
    name: "GraphLayerGenericBrowser",

    mixins: [
      GraphLayerMixin
    ],

    components: {
      GenericBrowserExplorer
    },

    data: () => ({
      selectedItem: null,
      selectedNav: null,

      nav: [],

      toggleOptions: false
    }),

    props: {
      value: Object,

      targetSchema: String,

      schemaProcessing: Object,

      domainLabel: String,

      title: String,

      items: Array
    },

    computed: {
      selection: {
        get() {
          const extra = {
            item: this.selectedItem
          };

          return Object.assign(extra,this.value);
        },

        set(value) {
          this.selectedItem = value.item || null;
          if (this.selectedItem) {
            this.selectedNav = this.nav.slice();
          }
          else {
            this.selectedNav = [];
          }

          this.$emit("input",value);
        }
      },

      hasSelection() {
        return this.selectedItem !== null;
      }
    },

    methods: {
      navigate(item) {
        this.selection = {};
        this.$refs.explorer.navigate(item.id);
      },

      openItem() {
        if (!this.selectedItem) {
          return;
        }

        window.open(this.selectedItem.webUrl,"_blank");
      }
    },

    watch: {
      value({ type, id }) {
        if (id === undefined) {
          this.selectedItem = null;
        }
        else {
          // If the value changed to a top-level item, make sure it is selected.
          const item = this.items.find(
            (i) => i.type === type && i.id === id
          );
          this.selectedItem = item || this.selectedItem;
        }
      },

      selectedItem(value) {
        this.$emit("item:update",value);
      }
    }
  };
</script>

<style module>
  .graph-layer-generic-browser {

  }

  .header {
    border-bottom: 3px solid var(--graph-layer-divider-color);
    padding: 0.75em 0;
  }

  .header__title {
    display: flex;
  }

  .header__info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .header__nav {
    padding: 0.25em 0;
  }

  .header__nav-item {
    padding: 0.5em;
    border-right: 3px solid var(--graph-layer-divider-color);
  }

  .header__nav-item:last-child {
    border-right: none;
  }

  .header__nav-item--active {
    font-weight: bold;
  }

  .header__selected {
    display: flex;
    align-items: center;
    gap: 0.25em;
  }

  .header__selected-label {
    font-size: 0.9em;
    font-weight: bold;
  }

  .user-header {
    border-bottom: 3px solid var(--graph-layer-divider-color);
    padding: 0.75em 0.5em;
  }

  .options {
    display: flex;
    flex-flow: column nowrap;
  }

  .options__menu {

  }

  .options__menu--toggled {
    border-bottom: 2px solid var(--graph-layer-divider-color);
    padding-bottom: 0.5em;
  }

  .options__toggle-icon {
    vertical-align: text-bottom;
  }

  .user-footer {
    border-top: 3px solid var(--graph-layer-divider-color);
    padding: 0.75em 0;
  }
</style>
