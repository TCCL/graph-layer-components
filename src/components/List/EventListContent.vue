<script>
  import parseISO from "date-fns/parseISO";

  import GraphLayerGenericCalendar from "../GenericCalendar/GenericCalendar.vue";
  import { DEFAULT_MAPPING } from "../ListBrowser/ListBrowserEventsConfigWidget.vue";

  import { extractQueryParam } from "../../core/helpers.js";

  function makeCacheKey(startDate,endDate,page) {
    const cacheKey = startDate.toISOString() + endDate.toISOString() + ":" + page.toString();
    return cacheKey;
  }

  function makeProvider(endpoint,config,$instance) {
    const cache = new Map();
    const mapping = Object.assign({},config || {},DEFAULT_MAPPING);

    function getCacheEntry(key) {
      if (!cache.has(key)) {
        cache.set(key,{});
      }
      return cache.get(key);
    }

    function extractFields(item) {
      const extracted = { "id":item.id };
      for (const key in mapping) {
        extracted[key] = item.fields[mapping[key]];
      }
      for (const key of ["startDate","endDate"]) {
        // NOTE: For some reason, the Graph API gives us the time in UTC zero,
        // even though they all should be interpreted in local time. To hack
        // around this at this time, we just take off zulu to force local time.
        if (extracted[key].endsWith("Z")) {
          extracted[key] = extracted[key].substring(0,extracted[key].length-1);
        }
        extracted[key] = parseISO(extracted[key]);
      }
      return extracted;
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

      const dateField = mapping.startDate;
      const expandFields = Object.values(mapping).join(",");

      let filterString = `fields/${dateField} ge '${startDate.toISOString()}'`;
      filterString += ` and fields/${dateField} lt '${endDate.toISOString()}'`;

      let url = new URL(`${endpoint}/items`,window.location.origin);
      url.searchParams.set("$filter",filterString);
      url.searchParams.set("expand",`fields(select=${expandFields})`);

      if (cacheEntry.skipToken) {
        url.searchParams.set("$skiptoken",cacheEntry.skipToken);
      }

      const init = {
        headers
      };

      return $instance.$fetchJson(url,init).then((payload) => {
        const extracted = payload.value.map(extractFields);
        cacheEntry.items = extracted;

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
