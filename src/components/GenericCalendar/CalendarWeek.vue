<template>
  <div :class="$style['calendar-week']" :style="styles">
    <calendar-event
      v-for="eventInfo in eventsForWeek"
      :key="eventInfo.event.id"
      :event-info="eventInfo"
      :class="$style['calendar-week__event']"
      :style="eventStyles(eventInfo)"
      />
  </div>
</template>

<script>
  import addDate from "date-fns/add";
  import setDate from "date-fns/set";
  import getDay from "date-fns/getDay";
  import compareAsc from "date-fns/compareAsc";
  import eachDayOfInterval from "date-fns/eachDayOfInterval";
  import areIntervalsOverlapping from "date-fns/areIntervalsOverlapping";
  import getOverlappingDaysInIntervals from "date-fns/getOverlappingDaysInIntervals";
  import isWithinInterval from "date-fns/isWithinInterval";

  import CalendarEvent from "./CalendarEvent.vue";

  const NORMAL_START_DATE = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  };

  const NORMAL_END_DATE = {
    hours: 23,
    minutes: 59,
    seconds: 59,
    milliseconds: 999
  };

  export default {
    name: "CalendarWeek",

    data: () => ({

    }),

    components: {
      CalendarEvent
    },

    props: {
      week: Number,
      startDate: Date,
      events: Array
    },

    computed: {
      styles() {
        const styles = {};

        styles["grid-area"] = `${this.week*2+1} / 1 / ${this.week*2+2} / 8`;

        return styles;
      },

      endDate() {
        // NOTE: Subtract off a second so that the end date is inclusive.
        return addDate(this.startDate,{ weeks:1, seconds:-1 });
      },

      eventsForWeek() {
        const events = [];

        const weekInterval = {
          start: this.startDate,
          end: this.endDate
        };

        for (let i = 0;i < this.events.length;++i) {
          const event = this.events[i];
          const eventInterval = {
            // Normalize event interval date components so that overlap is
            // detected with granularity no finer than day.
            start: setDate(event.startDate,NORMAL_START_DATE),
            end: setDate(event.endDate,NORMAL_END_DATE)
          };

          if (areIntervalsOverlapping(weekInterval,eventInterval)) {
            const eventInfo = {};
            eventInfo.event = event;
            eventInfo.row = 1;
            eventInfo.interval = eventInterval;
            eventInfo.duration = getOverlappingDaysInIntervals(weekInterval,eventInterval);
            eventInfo.days = eachDayOfInterval(eventInterval);

            let i = 0;
            while (i < eventInfo.days.length) {
              if (isWithinInterval(eventInfo.days[i],weekInterval)) {
                eventInfo.startDay = getDay(eventInfo.days[i]);
                break;
              }
              i += 1;
            }
            i = eventInfo.days.length-1;
            while (i >= 0) {
              if (isWithinInterval(eventInfo.days[i],weekInterval)) {
                eventInfo.endDay = getDay(eventInfo.days[i]);
                break;
              }
              i -= 1;
            }

            events.push(eventInfo);
          }
        }

        // Sort events by duration in descending order.
        events.sort((a,b) => {
          const n = b.duration - a.duration;
          if (n != 0) {
            return n;
          }

          return compareAsc(a.interval.start,b.interval.start);
        });

        // Assign row line numbers.
        for (let i = 0;i < events.length;++i) {
          const event = events[i];

          // Push down any other events whose interval overlap.
          for (let j = i+1;j < events.length;++j) {
            if (events[j].row == event.row
                && areIntervalsOverlapping(events[j].interval,event.interval))
            {
              events[j].row += 1;
            }
          }
        }

        return events;
      }
    },

    created() {

    },

    methods: {
      eventStyles(event) {
        const styles = {};

        styles["grid-area"] = `${event.row} / ${event.startDay+1} / ${event.row+1} / ${event.endDay+2}`;

        return styles;
      }
    }
  };
</script>

<style module>
  .calendar-week {
    display: grid;
    grid-template-columns: repeat(7,1fr);
    grid-auto-rows: 24px;
  }

  .calendar-week__event {
    z-index: 10;
    overflow: hidden;
  }
</style>
