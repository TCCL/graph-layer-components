<template>
  <div :class="[$style['calendar-event'],...classes]" @click="selected = true">
    <span :class="$style['calendar-event__text']">{{ eventInfo.event.title }}</span>
    <modal v-if="selected" :parent="$el.parentNode.parentNode" :title="eventInfo.event.title" @close="selected = false">
      <p><b>Event Start</b>: <disp-date :value="eventInfo.event.startDate" :format="fmt" /></p>
      <p><b>Event End</b>: <disp-date :value="eventInfo.event.endDate" :format="fmt" /></p>
      <p><b>Created By</b>: {{ eventInfo.event.createdBy }}</p>
      <p :class="$style['calendar-event__description']" v-html="eventInfo.event.description"></p>
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
      fmt: "iii d MMM yyyy 'at' h:mm b"
    }),

    props: {
      eventInfo: Object
    },

    computed: {
      classes() {
        const cls = [];

        if ("_calendar_index" in this.eventInfo.event) {
          const idx = this.eventInfo.event._calendar_index % 5;
          const style = `calendar-event--idx-${idx}`;
          cls.push(this.$style[style]);
        }

        return cls;
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
