<template>
  <div :class="[$style['calendar-event'],...classes]" @click="selected = true">
    <span :class="$style['calendar-event__text']">{{ event.title }}</span>
    <modal v-if="selected" :parent="$el.parentNode.parentNode" :title="event.title" @close="selected = false">
      <p v-if="!event.allDay"><b>Event Start</b>: <disp-date :value="event.startDate" :format="fmt" /></p>
      <p v-if="!event.allDay"><b>Event End</b>: <disp-date :value="event.endDate" :format="fmt" /></p>
      <p v-if="event.allDay"><b>All Day Event</b>: <disp-date :value="event.startDate" :format="allDayFmt" /> <span v-if="isMultiDay">through <disp-date :value="event.endDate" :format="allDayFmt" /></span></p>
      <p><b>Created By</b>: {{ event.createdBy }}</p>
      <p :class="$style['calendar-event__description']" v-html="event.description"></p>
    </modal>
  </div>
</template>

<script>
  import DispDate from "../../core/components/DispDate.vue";
  import Modal from "../../core/components/Modal.vue";

  export default {
    name: "CalendarEvent",

    components: {
      DispDate,
      Modal
    },

    data: () => ({
      selected: false,
      fmt: "eeee, MMMM do, yyyy, 'at' h:mm b",
      allDayFmt: "eeee, MMMM do, yyyy"
    }),

    props: {
      eventInfo: Object
    },

    computed: {
      classes() {
        const cls = [];

        if ("_calendar_index" in this.event) {
          const idx = this.event._calendar_index % 5;
          const style = `calendar-event--idx-${idx}`;
          cls.push(this.$style[style]);
        }

        return cls;
      },

      event() {
        return this.eventInfo.event;
      },

      isMultiDay() {
        return this.event.allDay
          && this.event.startDate.getTime() != this.event.endDate.getTime();
      }
    },

    created() {

    },

    methods: {

    }
  };
</script>

<style module>
  .calendar-event {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid var(--graph-layer-calendar-event-border-color);
    cursor: pointer;
  }
  .calendar-event.calendar-event--idx-0 {
    background-color: var(--graph-layer-calendar-event-background-color);
  }
  .calendar-event.calendar-event--idx-1 {
    background-color: var(--graph-layer-calendar-event-background-color-1);
  }
  .calendar-event.calendar-event--idx-2 {
    background-color: var(--graph-layer-calendar-event-background-color-2);
  }
  .calendar-event.calendar-event--idx-3 {
    background-color: var(--graph-layer-calendar-event-background-color-3);
  }
  .calendar-event.calendar-event--idx-4 {
    background-color: var(--graph-layer-calendar-event-background-color-4);
  }
  .calendar-event:hover {
    opacity: 0.33;
  }

  .calendar-event__text {
    color: var(--graph-layer-calendar-event-text-color);
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .calendar-event__description {
    white-space: pre-line;
  }
</style>
