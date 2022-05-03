// components/DriveBrowser/DriveSchemaProcessing.js

export default {
  userList(result) {
    const { value: userList } = result;

    const items = [];
    for (let i = 0;i < userList.length;++i) {
      const user = userList[i];
      items.push({
        id: user.id,
        type: "user",
        label: user.displayName,
        caption: user.jobTitle || user.displayName,
        endpoint: "/users/" + user.id + "/drives",
        schema: "driveList"
      });
    }

    return items;
  },

  groupList(result) {
    const { value: groupList } = result;

    const items = [];
    for (let i = 0;i < groupList.length;++i) {
      const group = groupList[i];
      items.push({
        id: group.id,
        type: "group",
        label: group.displayName,
        caption: group.description || group.displayName,
        endpoint: "/groups/" + group.id + "/drives",
        schema: "driveList"
      });
    }

    return items;
  },

  siteList(result) {
    const { value: siteList } = result;

    const items = [];
    for (let i = 0;i < siteList.length;++i) {
      const site = siteList[i];
      items.push({
        id: site.id,
        type: "site",
        label: site.displayName,
        caption: site.description || site.displayName,
        endpoint: "/sites/" + site.id + "/drives",
        schema: "driveList"
      });
    }

    return items;
  },

  driveList(result) {
    const { value: driveList } = result;

    const items = [];
    for (let i = 0;i < driveList.length;++i) {
      const drive = driveList[i];
      items.push({
        id: drive.id,
        type: "drive",
        label: drive.name,
        caption: drive.description || drive.name,
        endpoint: "/drives/" + drive.id,
        schema: "drive",
        webUrl: drive.webUrl
      });
    }

    return items;
  }
};
