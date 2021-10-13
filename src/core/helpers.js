// core/helpers.js

function nop() {

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

export {
  nop,
  extractQueryParam,
  formatByteSize
};
