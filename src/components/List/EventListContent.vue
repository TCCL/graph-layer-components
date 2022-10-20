<script>
  import GraphLayerGenericCalendar from "../GenericCalendar/GenericCalendar.vue";

  function makeProvider(endpoint,config) {
    async function queryEvents(startDate,endDate) {

    }

    return queryEvents;
  }

  export default {
    name: "EventListContent",
    functional: true,

    props: {
      endpoint: String,
      config: Object
    },

    render(createElem,context) {
      const classes = [context.$style["event-list-content"]];
      if (context.data.class) {
        classes.push(context.data.class);
      }

      const data = {
          "class": classes,
          props: {
            eventProvider: makeProvider(context.props.endpoint,context.props.config)
          },
          style: context.data.style,
          attrs: context.data.attrs,
          on: context.data.on,
          nativeOn: context.data.nativeOn
      };

      const el = createElem(GraphLayerGenericCalendar,data);

      return el;
    }
  };
</script>

<style module>
  .event-list-content {

  }
</style>
