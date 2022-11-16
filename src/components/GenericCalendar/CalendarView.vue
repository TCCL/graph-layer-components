20px<template>
  <div :class="$style['calendar-view']">
    <div :class="$style['calendar-view__dow']">
      <div v-for="dow in dowList" :class="$style['calendar-view-dow']">
        <span :class="$style['calendar-view-dow__text']">{{ dow.label }}</span>
      </div>
    </div>

    <component v-for="entry,index in entries" v-bind="entry" :key="index" />
  </div>
</template>

<script>
  import getDaysInMonth from "date-fns/getDaysInMonth";
  import getDay from "date-fns/getDay";
  import getDate from "date-fns/getDate";
  import getMonth from "date-fns/getMonth";
  import addDate from "date-fns/add";
  import setDate from "date-fns/set";
  import toDate from "date-fns/toDate";

  import Vue from "vue";

  import CalendarWeek from "./CalendarWeek.vue";

  const ADD_DAY = {
    days: 1
  };

  const SUBTRACT_DAY = {
    days: -1
  };

  function backupDate(dt,dow) {
    while (getDay(dt) != dow) {
      dt = addDate(dt,SUBTRACT_DAY);
    }
    return dt;
  }

  const DateLabel = {
    name: "DateLabel",
    functional: true,
    props: {
      label: String,
      outOfRange: Boolean
    },
    render(createElem,context) {
      const $style = context.parent.$style;

      const inner = createElem(
        "span",
        { "class":$style["date-label__text"] },
        context.props.label
      );

      const classes = [];
      classes.push($style["date-label"]);
      if (context.props.outOfRange) {
        classes.push($style["date-label--outofrange"]);
      }

      const data = {
        "class": classes,
        style: context.data.style
      };

      return createElem("div",data,[inner]);
    }
  };

  export default {
    name: "CalendarView",

    components: {

    },

    data: () => ({

    }),

    props: {
      date: Date,
      events: Array
    },

    computed: {
      dowList() {
        const dows = [
          { label:"Sunday", index:0 },
          { label:"Monday", index:1 },
          { label:"Tuesday", index:2 },
          { label:"Wednesday", index:3 },
          { label:"Thursday", index:4 },
          { label:"Friday", index:5 },
          { label:"Saturday", index:6 }
        ];

        return dows;
      },

      startDate() {
        // Back up date to beginning of first week.
        const dt = setDate(this.date,{ date:1 });
        return backupDate(dt,this.dowList[0].index);
      },

      entries() {
        let dt;
        const entries = [];
        const ndays = getDaysInMonth(this.date);
        const nweeks = Math.ceil((ndays + getDay(this.date))  / 7);

        // Generate week entries that will render events.
        dt = toDate(this.startDate);
        for (let i = 1;i <= nweeks;++i) {
          entries.push({ is:CalendarWeek, week:i, events:this.events, date:dt });
          dt = addDate(dt,{ days:7 });
        }

        // Generate calendar date label entries.
        dt = toDate(this.startDate);
        for (let i = 1;i <= nweeks;++i) {
          for (let j = 1;j <= 7;++j) {
            const label = getDate(dt).toString();
            const style = {};
            style["grid-area"] = `${i*2} / ${j} / ${(i+1)*2} / ${j+1}`;
            const outOfRange = ( getMonth(dt) != getMonth(this.date) );
            entries.push({ is:DateLabel, label, outOfRange, style });

            dt = addDate(dt,ADD_DAY);
          }
        }

        return entries;
      }
    },

    created() {

    },

    methods: {

    }
  };
</script>

<style module>
  .calendar-view {
    display: grid;
    grid-template-columns: repeat(7,1fr);
    grid-template-rows: 20px 20px 1fr 20px 1fr 20px 1fr 20px 1fr 20px 1fr 20px 1fr;
  }

  .calendar-view__dow {
    display: flex;
    grid-area: 1 / 1 / 2 / 8;
  }

  .calendar-view-dow {
    flex: 1;
    padding-left: 4px;
  }

  .calendar-view-dow__text {
    text-transform: uppercase;
    font-size: 0.5em;
    opacity: 0.75;
  }

  /* <date-label> */

  .date-label {
    border: 1px solid var(--graph-layer-border-color);
    padding: 2px 4px;
  }

  .date-label__text {
    font-size: 0.95em;
    font-weight: bold;
  }
  .date-label--outofrange > .date-label__text {
    font-weight: normal;
    opacity: 0.35;
  }
</style>
