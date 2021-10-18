// core/icons/manifest.js

import errorSvg from "./error.svg";
import fileSvg from "./file.svg";
import folderSvg from "./folder.svg";
import arrowBackSvg from "./arrow-back.svg";
import arrowLeftSvg from "./arrow-left.svg";
import arrowRightSvg from "./arrow-right.svg";
import arrowDownSvg from "./arrow-down.svg";
import externalLinkSvg from "./external-link.svg";

export default function (iconId) {
  switch (iconId) {
  case "file":
    return fileSvg;
  case "folder":
    return folderSvg;
  case "arrow-back":
    return arrowBackSvg;
  case "arrow-left":
    return arrowLeftSvg;
  case "arrow-right":
    return arrowRightSvg;
  case "arrow-down":
    return arrowDownSvg;
  case "external-link":
    return externalLinkSvg;
  }

  return errorSvg;
}
