<script>
  import dateFormat from "date-fns/format";
  import parseISO from "date-fns/parseISO";

  function getDisplayValue(value,format) {
    if (!value) {
      return '';
    }

    let dt;
    if (value instanceof Date) {
      dt = value;
    }
    else {
      dt = parseISO(value);
    }

    if (Object.prototype.toString.call(dt) === "[object Date]"
        && !isNaN(dt.getTime()))
    {
      try {
        return dateFormat(dt,format);
      } catch (ex) {
        console.warn(ex);
      }
    }

    return "Invalid Date";
  }

  export default {
    name: "DispDate",
    functional: true,

    props: {
      value: [String,Date],
      format: {
        type: String,
        default: "MMMM do, yyyy"
      }
    },

    render(createElement,context) {
      const displayValue = getDisplayValue(context.props.value,context.props.format);
      return createElement("span",displayValue);
    }
  };
</script>
