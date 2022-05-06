<template>
  <div :class="$style['graph-layer-generic-browser-options-form']">
    <div v-if="$errorState" :class="$style.error">
      <icon i="error" error /><span>{{ errorMessage }}</span>
    </div>

    <div v-if="sitesEnabled" :class="$style.form">
      <span :class="$style.label">Add Site</span>
      <div :class="$style['input-wrapper']">
        <input :class="$style.input" v-model="siteUrl" type="text" placeholder="Site URL...">
        <click-text @click="submitSite">Add</click-text>
      </div>
      <caption-text>Enter a site URL (e.g. <code>https://myorganization.sharepoint.com/sites/MySite</code>).</caption-text>
    </div>
  </div>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin";
  import { extractErrorMessage } from "../../core/helpers";

  export default {
    name: "GenericBrowserOptionsForm",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      siteUrl: "",
      working: false
    }),

    props: {
      schemaProcessing: Object,
      enableSites: Boolean
    },

    computed: {
      sitesEnabled() {
        return this.enableSites && "siteList" in this.schemaProcessing;
      },

      errorMessage() {
        return extractErrorMessage(this.$errorState);
      }
    },

    created() {

    },

    methods: {
      submitSite() {
        if (!this.siteUrl || this.working || !this.sitesEnabled) {
          return;
        }

        this.$errorState = null;

        // Parse out hostname and server-relative path.
        const [ _, hostName, serverPath ] = this.siteUrl.match(/^(?:https?:\/\/)?([^\/]+)\/(.*)/);
        if (!hostName || !serverPath) {
          this.$errorState = "Invalid site URL";
          return;
        }

        const endpoint = "/sites/" + hostName + ":/" + serverPath;
        this.$fetchJson(endpoint).then((site) => {
          const [ item ] = this.schemaProcessing.siteList({
            value: [site]
          });

          this.$emit("submit",item);
          this.siteUrl = "";
        });
      }
    }
  };
</script>

<style module>
  .graph-layer-generic-browser-options-form {

  }

  .form {
    display: flex;
    flex-flow: column nowrap;
    gap: 0.125em;
    margin: 0.5em 0;
  }

  .input-wrapper {
    display: flex;
    gap: 1em;
    flex-flow: row nowrap;
    justify-content: space-between;
    margin-bottom: 0.45em;
  }

  .input {
    flex: 1;
    font-size: 18px;
    outline: none;
    padding: 4px;
    border: none;
    border-bottom: 2px solid var(--graph-layer-divider-color);
  }

  .label {
    font-size: 0.75em;
    font-weight: bold;
  }

  .error {
    display: flex;
    align-items: center;
    margin: 0.25em 0;
    font-weight: bold;
  }
</style>
