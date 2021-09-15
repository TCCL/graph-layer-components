// core/icons/manifest.js

import errorSvg from "./error.svg";
import fileSvg from "./file.svg";
import folderSvg from "./folder.svg";

export default function (iconId) {
  switch (iconId) {
  case "file":
    return fileSvg;
  case "folder":
    return folderSvg;
  }

  return errorSvg;
}
