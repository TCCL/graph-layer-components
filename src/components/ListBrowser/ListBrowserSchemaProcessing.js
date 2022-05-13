// components/ListBrowser/ListBrowserSchemaProcessing.js

export default {
  siteList(result) {
    const { value: siteList } = result;

    const items = [];
    for (let i = 0;i < siteList.length;++i) {
      const site = siteList[i];
      items.push({
        id: site.id,
        type: "site",
        icon: "globe",
        label: site.displayName,
        caption: site.description || site.displayName,
        endpoint: "/sites/" + site.id + "/lists",
        schema: "listList"
      });
    }

    return items;
  },

  listList(result,parent) {
    const { value: listList } = result;

    const items = [];
    for (let i = 0;i < listList.length;++i) {
      const list = listList[i];
      items.push({
        id: list.id,
        parentId: parent.id,
        type: "list",
        icon: "list",
        label: list.name,
        caption: list.name,
        endpoint: "/sites/" + parent.id + "/lists/" + list.id,
        schema: "list",
        webUrl: list.webUrl
      });
    }

    return items;
  }
};
