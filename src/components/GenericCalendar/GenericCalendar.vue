<template>
  <div :class="$style['generic-calendar']">
    <div :class="$style['generic-calendar__header']">
      <div title="Previous Month">
        <icon button i="arrow-left" @click.stop="navigatePrevious" :disabled="!canNavigatePrevious || $loadingState" />
      </div>

      <div title="Next Month">
        <icon button i="arrow-right" @click.stop="navigateNext" :disabled="!canNavigateNext || $loadingState" />
      </div>

      <div>
        <caption-text>{{ windowDateDisplay }}</caption-text>
      </div>
    </div>

    <graph-layer-wrapper v-bind="$wrapperBind">
      <calendar-view v-if="hasEvents" :class="$style['generic-calendar__view']" :date="windowDate" :events="events" />
    </graph-layer-wrapper>
  </div>
</template>

<script>
  import getYear from "date-fns/getYear";
  import getMonth from "date-fns/getMonth";
  import getDate from "date-fns/getDate";
  import addDate from "date-fns/add";
  import setDate from "date-fns/set";
  import formatDate from "date-fns/format";
  import dateIsAfter from "date-fns/isAfter";

  import CalendarView from "./CalendarView.vue";

  import GraphLayerMixin from "../../core/mixins/GraphLayerMixin.js";
  import LoadErrorMixin from "../../core/mixins/LoadErrorMixin.js";

  const now = Date.now();

  const SET_NORMAL_WINDOW = {
    date: 1,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  };

  const ADD_MONTH = {
    months: 1
  };

  const SUBTRACT_MONTH = {
    months: -1
  };

  const EPOCH = new Date(1970,0);

  export default {
    name: "GraphLayerGenericCalendar",

    mixins: [
      GraphLayerMixin,
      LoadErrorMixin
    ],

    components: {
      CalendarView
    },

    data: () => ({
      window: {
        year: getYear(now),
        month: getMonth(now)
      },
      events: null
    }),

    props: {
      eventProvider: Function
    },

    computed: {
      queryEvents() {
        return this.eventProvider.bind(this);
      },

      canNavigatePrevious() {
        const dt = addDate(this.windowDate,SUBTRACT_MONTH);
        return dateIsAfter(dt,EPOCH);
      },

      canNavigateNext() {
        //const now = setDate(Date.now(),SET_NORMAL_WINDOW);
        //const dt = addDate(this.windowDate,ADD_MONTH);
        //return !dateIsAfter(dt,now);
        return true;
      },

      windowDate() {
        return new Date(this.window.year,this.window.month,1);
      },

      windowDateDisplay() {
        return formatDate(this.windowDate,"MMMM yyyy");
      },

      hasEvents() {
        return Array.isArray(this.events);
      }
    },

    created() {
      this.loadWindow();
    },

    methods: {
      loadWindow() {
        const startDate = setDate(this.windowDate,{ date:1 });
        const endDate = addDate(startDate,ADD_MONTH);

        this.events = null;
        this.queryEvents(startDate,endDate).then((result) => {
          const { hasNextPage, items } = result;

          this.events = items;
        });
      },

      navigatePrevious() {
        if (!this.canNavigatePrevious) {
          return;
        }

        const dt = addDate(this.windowDate,SUBTRACT_MONTH);
        this.window.year = getYear(dt);
        this.window.month = getMonth(dt);
        this.loadWindow();
      },

      navigateNext() {
        if (!this.canNavigateNext) {
          return;
        }

        const dt = addDate(this.windowDate,ADD_MONTH);
        this.window.year = getYear(dt);
        this.window.month = getMonth(dt);
        this.loadWindow();
      }
    }
  };
</script>

<style module>
  .generic-calendar {
    display: flex;
    flex-flow: column nowrap;
  }

  .generic-calendar__header {
    display: flex;
    gap: 0.5em;
  }

  .generic-calendar__view {
    flex: 1 0;
  }
</style>
