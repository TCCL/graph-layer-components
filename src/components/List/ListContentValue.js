// components/List/ListContentValue.js

import { format, formatRelative, parseISO } from "date-fns";

export default {
  name: "ListContentValue",

  functional: true,

  props: ['value','column'],

  render(h,context) {
    const { props: { value, column }, parent: { $style } } = context;

    let tag = "span";
    let data = { "class":[], "attrs":[] };
    let children = [value];

    if (typeof value === "object") {
      if (value.Url) {
        tag = "a";
        data.attrs["href"] = value.Url;
        data.attrs["target"] = "_blank";
        children = [value.Description || "Link"];
      }
    }
    else if (typeof value === "boolean") {
      data["class"].push($style["list-content__value--boolean"]);
      data["class"].push(
        value ? $style["list-content__value--boolean-yes"]
          : $style["list-content__value--boolean-no"]
      );
      children = [value ? "Yes" : "No"];
    }
    else if (column.text) {
      if (column.text.allowMultipleLines) {
        tag = "pre";
      }
    }
    else if (column.currency) {
      switch (column.currency.locale) {
      case "en-US":
        data["class"].push($style["list-content__value--currency-US"]);
        break;
      }
    }
    else if (column.dateTime && value) {
      const dt = parseISO(value);
      const now = new Date();

      switch (column.dateTime.displayAs) {
      case "friendly":
        children = [formatRelative(dt,now)];
        break;

      case "standard":
        if (column.dateTime.format == "dateOnly") {
          children = [format(dt,"MMMM do, yyyy")];
        }
        else {
          children = [format(dt,"MMMM do, yyyy 'at' h:mm aa")];
        }

        break;

      case "default":
      default:
        // Leave as-is.
        break;
      }
    }

    return h(tag,data,children);
  }
};
