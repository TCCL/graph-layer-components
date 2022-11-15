<template>
  <div :class="$style['calendar-view']">
    <div :class="$style['calendar-view__dow']">
      <div v-for="dow in dowList" :class="$style['calendar-view-dow']">
        <span :class="$style['calendar-view-dow__text']">{{ dow.label }}</span>
      </div>
    </div>

    <template v-for="week in entries">
      <template v-for="entry in week">
        <component v-bind="entry" />
      </template>
    </template>

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
      if (context.outOfRange) {
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
      date: Date
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
        const result = [];

        // Generate the calendar entry set.
        let dt = toDate(this.startDate);
        const ndays = getDaysInMonth(this.date);
        const nweeks = Math.ceil(ndays / 7);
        for (let i = 1;i <= nweeks;++i) {
          const entries = [];

          for (let j = 1;j <= 7;++j) {
            // Generate label entries.
            const label = getDate(dt).toString();
            const style = {};
            style["grid-area"] = "dt" + i.toString() + j.toString();
            const outOfRange = ( getMonth(dt) != getMonth(this.date) );
            entries.push({ is:DateLabel, label, outOfRange, style });

            // Generate date entries with events.

            dt = addDate(dt,ADD_DAY);
          }

          result.push(entries);
        }

        return result;
      },

      entryList() {

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
    grid-template-rows: auto auto 1fr auto 1fr auto 1fr auto 1fr auto 1fr;
    grid-template-areas:
      "dow dow dow dow dow dow dow"
      "dt11 dt12 dt13 dt14 dt15 dt16 dt17"
      "cl11 cl12 cl13 cl14 cl15 cl16 cl17"
      "dt21 dt22 dt23 dt24 dt25 dt26 dt27"
      "cl21 cl22 cl23 cl24 cl25 cl26 cl27"
      "dt31 dt32 dt33 dt34 dt35 dt36 dt37"
      "cl31 cl32 cl33 cl34 cl35 cl36 cl37"
      "dt41 dt42 dt43 dt44 dt45 dt46 dt47"
      "cl41 cl42 cl43 cl44 cl45 cl46 cl47"
      "dt51 dt52 dt53 dt54 dt55 dt56 dt57"
      "cl51 cl52 cl53 cl54 cl55 cl56 cl57"
  }

  .calendar-view__dow {
    display: flex;
    grid-area: dow;
  }

  .calendar-view-dow {
    flex: 1;
    border-left: 1px solid var(--graph-layer-border-color);
  }
  .calendar-view-dow:nth-child(1) {
    border-left: none;
  }

  .calendar-view-dow__text {
    text-transform: uppercase;
    font-size: 0.5em;
    opacity: 0.75;
  }

  /* <date-label> */

  .date-label {
    border-top: 1px solid var(--graph-layer-border-color);
    border-left: 1px solid var(--graph-layer-border-color);
  }
  .date-label:nth-child(7n+2) {
    border-left: none;
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
