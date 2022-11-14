<script>
  import GraphLayerGenericCalendar from "../GenericCalendar/GenericCalendar.vue";

  import { extractQueryParam } from "../../core/helpers.js";

  function makeCacheKey(startDate,endDate,page) {
    const cacheKey = startDate.toISOString() + endDate.toISOString() + ":" + page.toString();
    return cacheKey;
  }

  function makeProvider(endpoint,config,$instance) {
    const cache = new Map();

    function getCacheEntry(key) {
      if (!cache.has(key)) {
        cache.set(key,{});
      }
      return cache.get(key);
    }

    async function queryEvents(startDate,endDate,_page) {
      const page = _page || 1;

      const cacheKey = makeCacheKey(startDate,endDate,page);
      const cacheEntry = getCacheEntry(cacheKey);

      const headers = {
        // We are filtering on non-indexed fields, so we need to pass a Prefer
        // header to work around this.
        "Prefer": "HonorNonIndexedQueriesWarningMayFailRandomly"
      };

      if (cacheEntry.items) {
        return cacheEntry.Items;
      }

      let filterString = "fields/EventDate ge ";
      filterString += "'" + startDate.toISOString() + "'";
      filterString += " and fields/EventDate lt ";
      filterString += "'" + endDate.toISOString() + "'";

      let url = new URL(endpoint + "/items",window.location.origin);
      url.searchParams.set("$filter",filterString);

      if (cacheEntry.skipToken) {
        url.searchParams.set("$skiptoken",cacheEntry.skipToken);
      }

      const init = {
        headers
      };

      return $instance.$fetchJson(url,init).then((payload) => {
        cacheEntry.items = payload.value;

        const skipToken = extractQueryParam(payload["@data.nextLink"],"$skiptoken");
        if (skipToken) {
          const nextCacheKey = makeCacheKey(startDate,endDate,page+1);
          const nextCacheEntry = getCacheEntry(nextCacheKey);
          nextCacheEntry.skipToken = skipToken;
        }

        return { items: cacheEntry.items, hasNextPage: !!cacheEntry.skipToken };
      });
    }

    return queryEvents;
  }

  export default {
    name: "EventListContent",
    functional: true,

    props: {
      endpoint: String,
      config: Object,
      $instance: Object
    },

    render(createElem,context) {
      const classes = [context.$style["event-list-content"]];
      if (context.data.class) {
        classes.push(context.data.class);
      }

      const data = {
          "class": classes,
          props: {
            eventProvider: makeProvider(
              context.props.endpoint,
              context.props.config,
              context.props.$instance
            )
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
