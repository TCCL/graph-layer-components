// core/helpers.js

function extractQueryParam(_query,name) {
  if (typeof _query !== "string" || query.length == 0) {
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

export {
  extractQueryParam
};
