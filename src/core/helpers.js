// core/helpers.js

function nop() {

}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value != 0;
  }

  if (typeof value === "string") {
    const valueLower = value.toLowerCase();
    return valueLower !== "false"
      && valueLower !== "disable"
      && valueLower !== "disabled"
      && valueLower !== "off"
      && valueLower !== "0";
  }

  return !!value;
}

function extractQueryParam(_query,name) {
  if (typeof _query !== "string" || _query.length == 0) {
    return null;
  }

  let query = _query;
  const index = query.indexOf("?");
  if (index >= 0) {
    query = query.substring(index+1);
  }

  const pairs = query.split("&");
  for (let i = 0;i < pairs.length;++i) {
    const [ n, v ] = pairs[i].split("=",2);
    if (name == n) {
      return v;
    }
  }

  return null;
}

function formatByteSize(nbytes) {
  const SFX = [
    [1073741824,'Gb'],
    [1048576,'Mb'],
    [1024,'kb'],
    [1,'b'],
    [0,'']
  ];

  let i = 0;
  while (i < SFX.length && nbytes < SFX[i][0]) {
    i += 1;
  }

  const [ m, x ] = SFX[i];

  if (m > 0) {
    return (Math.round(nbytes / m * 100) / 100).toString() + x;
  }

  return nbytes.toString();
}

function isGraphLayerError(err) {
  return err.status && err.error && err.message;
}

function isMicrosoftError(err) {
  return typeof err.error === "object"
    && err.error.code
    && err.error.message
    && err.error.innerError;
}

function extractErrorMessage(err) {
  if (typeof err === "object"
      && err.error
      && err.message)
  {
    return err.error;
  }

  if (typeof err === "object"
      && err.code
      && err.payload)
  {
    if (isGraphLayerError(err.payload)) {
      return err.payload.error;
    }
    if (isMicrosoftError(err.payload)) {
      return err.payload.error.message;
    }
  }
  else if (typeof err === "string") {
    return err;
  }

  return "An error occurred";
}

function sortBy(prop) {
  return function(a,b) {
    let aa, bb;
    if (typeof prop === "function") {
      aa = prop(a);
      bb = prop(b);
    }
    else {
      aa = a[prop];
      bb = b[prop];
    }
    return aa < bb ? -1 : (aa > bb ? 1 : 0);
  };
}

const sortByName = sortBy("name");
const sortByLabel = sortBy("label");

export {
  nop,
  normalizeBoolean,
  extractQueryParam,
  formatByteSize,
  isGraphLayerError,
  isMicrosoftError,
  extractErrorMessage,
  sortBy,
  sortByName,
  sortByLabel
};
