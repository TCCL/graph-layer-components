<template>
  <graph-layer-wrapper
    :loading-state="$loadingState"
    :error-state="$errorState"
    class="graph-layer-user-wrapper justify-around"
    :class="[$themeClass]"
    >
    <div class="graph-layer-user">
      <avatar ref="avatar" :endpoint="endpoint" :display-name="userInfo.displayName" />
      <div class="user-info">
        <div class="name">{{ userInfo.displayName }}</div>
        <div class="job-title caption">{{ userInfo.jobTitle }}</div>
        <div class="emailAddress"><a :href="emailLink">{{ userInfo.mail }}</a></div>
      </div>
    </div>
  </graph-layer-wrapper>
</template>

<script>
  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";
  import Avatar from "./Avatar.vue";

  export default {
    name: "GraphLayerUser",

    components: {
      Avatar
    },

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    data: () => ({
      userInfo: {}
    }),

    props: {
      id: {
        type: String,
        default: null
      },

      userPrincipleName: {
        type: String,
        default: null
      },

      me: {
        type: [Boolean,String],
        default: false
      }
    },

    computed: {
      endpoint() {
        if (this.me) {
          return "/me";
        }

        if (this.id) {
          return "/users/" + this.id;
        }

        if (this.userPrincipleName) {
          return "/users/" + this.userPrincipleName;
        }

        return null;
      },

      emailLink() {
        if (!this.userInfo.mail) {
          return "#";
        }

        return "mailto:" + this.userInfo.mail;
      }
    },

    created() {
      this.load();
    },

    methods: {
      load() {
        if (!this.endpoint) {
          return;
        }

        const select = [
          "displayName",
          "jobTitle",
          "mail"
        ];

        const params = new URLSearchParams();
        params.append("$select",select.join(","));

        let endpoint = this.endpoint;
        endpoint += "?" + params.toString();

        this.$fetchJson(endpoint).then((data) => {
          this.userInfo = data;
        });
      }
    },

    watch: {
      endpoint() {
        this.load();
      }
    }
  };
</script>

<style scoped>
  .graph-layer-user {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding-left: 1em;
  }

  .avatar {
    flex: 1 1 auto;
  }

  .user-info {
    flex: 8 0 auto;
    margin-left: 1em;
  }
</style>
