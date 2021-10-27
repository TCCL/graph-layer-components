// globals.js

const globals = {
  // The default GraphLayer instance to use when a component is created.
  graphLayer: null,

  // Fallback load/error state. (This shouldn't be used in practice.)
  loadError: {
    loading: false,
    error: null
  }
};

export default globals;
