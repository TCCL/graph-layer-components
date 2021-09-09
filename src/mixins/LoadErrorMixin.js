// mixins/LoadErrorMixin.js

function findChildrenWith($children,key,recursive) {
  const results = [];

  for (let i = 0;i < $children.length;++i) {
    const $child = $children[i];

    // Skip child wrapper elements so that they become their own scope.
    if ($child.$options.name == "GraphLayerWrapper") {
      continue;
    }

    if (recursive && $child.$children) {
      results = results.concat(findChildrenWith($children.$children,key,true));
    }

    if ($child.$data && $child.key) {
      results.push($child);
    }
  }

  return results;
}

export default {
  data: () => ({
    loading: false,
    error: null
  }),

  computed: {
    $loadingState() {
      if (!this.loading) {
        const children = findChildrenWith(this.$children,"$loadingState");
        return children.length > 0;
      }

      return true;
    },

    $errorState() {
      if (!this.error) {
        const children = findChildrenWith(this.$children,"$errorState");

        if (children.length > 0) {
          return children[1].$errorState;
        }

        return null;
      }

      return this.error;
    }
  }
};
