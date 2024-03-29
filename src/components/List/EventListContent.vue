<template>
  <div :class="$style['event-list-content-wrapper']">
    <graph-layer-generic-calendar
      :class="$style['event-list-content']"
      :event-provider="eventProvider"
      />
  </div>
</template>

<script>
  import parseISO from "date-fns/parseISO";
  import parseDateWithFormat from "date-fns/parse";

  import { createRecurrenceData } from "./recurrence.js";

  import GraphLayerGenericCalendar from "../GenericCalendar/GenericCalendar.vue";
  import { DEFAULT_MAPPING } from "../ListBrowser/ListBrowserEventsConfigWidget.vue";

  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import { extractQueryParam } from "../../core/helpers.js";

  function makeCacheKey(startDate,endDate,page) {
    const cacheKey = startDate.toISOString() + endDate.toISOString() + ":" + page.toString();
    return cacheKey;
  }

  function makeProvider(endpoint,config) {
    const cache = new Map();
    const mapping = Object.assign({},DEFAULT_MAPPING,config || {});
    const refDate = new Date();

    refDate.setMilliseconds(0);
    refDate.setSeconds(0);
    refDate.setMinutes(0);
    refDate.setHours(0);

    function getCacheEntry(key) {
      if (!cache.has(key)) {
        cache.set(key,{});
      }
      return cache.get(key);
    }

    function extractFields(item) {
      const extracted = {
        id: item.id,
        render_id: `${endpoint}_${item.id}`
      };

      for (const key in mapping) {
        extracted[key] = item.fields[mapping[key]];
      }

      // Parse dates using the format given to us by the Microsoft platform.
      for (const key of ["startDate","endDate"]) {
        if (extracted.allDay) {
          let dateString = extracted[key];
          const index = dateString.search("T.+$");
          if (index >= 0) {
            dateString = dateString.slice(0,index);
          }
          extracted[key] = parseDateWithFormat(dateString,"yyyy-MM-dd",refDate);
        }
        else {
          extracted[key] = parseISO(extracted[key]);
        }
      }

      if (extracted.recurrence) {
        extracted.recurrence = createRecurrenceData(extracted.recurrence);
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
        return { items:cacheEntry.items, hasNextPage:cacheEntry.hasNextPage };;
      }

      const startDateField = mapping.startDate;
      const endDateField = mapping.endDate;
      const expandFields = Object.values(mapping).join(",");

      let filterString = `(fields/${startDateField} ge '${startDate.toISOString()}'`;
      filterString += ` and fields/${startDateField} lt '${endDate.toISOString()}')`;
      filterString += ` or (fields/${endDateField} ge '${startDate.toISOString()}'`;
      filterString += ` and fields/${endDateField} lt '${endDate.toISOString()}')`;
      filterString += ` or (fields/${startDateField} lt '${startDate.toISOString()}'`;
      filterString += ` and fields/${endDateField} ge '${endDate.toISOString()}')`;

      let url = new URL(`${endpoint}/items`,window.location.origin);
      url.searchParams.set("$filter",filterString);
      url.searchParams.set("expand",`fields(select=${expandFields})`);

      if (cacheEntry.skipToken) {
        url.searchParams.set("$skiptoken",cacheEntry.skipToken);
      }

      const init = {
        headers
      };

      return this.$fetchJson(url,init).then((payload) => {
        const items = [];
        const extracted = payload.value.map(extractFields);

        extracted.forEach((item) => {
          if (item.recurrence) {
            item.recurrence.replicate(item,startDate,endDate).forEach(
              (x) => items.push(x)
            );
          }
          else {
            items.push(item);
          }
        });
        cacheEntry.items = items;
        cacheEntry.hasNextPage = !!cacheEntry.skipToken;

        const skipToken = extractQueryParam(payload["@data.nextLink"],"$skiptoken");
        if (skipToken) {
          const nextCacheKey = makeCacheKey(startDate,endDate,page+1);
          const nextCacheEntry = getCacheEntry(nextCacheKey);
          nextCacheEntry.skipToken = skipToken;
        }

        return { items:cacheEntry.items, hasNextPage:cacheEntry.hasNextPage };
      });
    }

    return queryEvents;
  }

  function makeTopLevelProvider(endpoint,config,children) {
    const providers = [makeProvider(endpoint,config)].concat(
      children.map((child) => makeProvider(child.endpoint,child.config))
    );

    async function queryEvents(start,end,page) {
      let result = { items:[], hasNextPage:false };

      for (let i = 0;i < providers.length;++i) {
        const { items, hasNextPage } = await providers[i].call(this,start,end,page);
        items.forEach((item) => item._calendar_index = i);
        result.items = result.items.concat(items);
        result.hasNextPage = result.hasNextPage || hasNextPage;
      }

      return result;
    }

    return queryEvents;
  }

  export default {
    name: "EventListContent",

    mixins: [
      GraphLayerMixin
    ],

    components: {
      GraphLayerGenericCalendar
    },

    data: () => ({

    }),

    props: {
      endpoint: String,
      config: Object,
      children: Array
    },

    computed: {
      eventProvider() {
        return makeTopLevelProvider(this.endpoint,this.config,this.children);
      }
    },

    created() {

    },

    methods: {

    }
  };
</script>

<style module>
  .event-list-content-wrapper {
    display: flex;
    flex-flow: row nowrap;
  }

  .event-list-content {
    flex: 1;
  }
</style>
