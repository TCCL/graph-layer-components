// components/Drive/EntryMixin.js

import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
import { formatByteSize } from "../../core/helpers.js";

export default {
  mixins: [GraphLayerMixin],

  props: {
    item: Object
  },

  computed: {
    sizeFormatted() {
      return formatByteSize(this.item.size);
    },

    modifiedBy() {
      if (this.item.lastModifiedBy && this.item.lastModifiedBy.user) {
        if (this.item.lastModifiedBy.user.displayName) {
          return this.item.lastModifiedBy.user.displayName;
        }

        if (this.item.lastModifiedBy.user.email) {
          return this.item.lastModifiedBy.user.email;
        }
      }

      return "Unknown";
    },

    modifiedByLink() {
      if (this.item.lastModifiedBy && this.item.lastModifiedBy.user) {
        if (this.item.lastModifiedBy.user.email) {
          return "mailto:" + this.item.lastModifiedBy.user.email;
        }
      }

      return null;
    },

    modifiedOn() {
      return this.item.lastModifiedDateTime;
    }
  },

  methods: {
    navigate() {

    }
  }
};
