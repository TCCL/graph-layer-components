<template>
  <div :class="$style['calendar-event']" @click="selected = true">
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

    },

    created() {

    },

    methods: {

    }
  };
</script>

<style module>
  .calendar-event {
    background-color: var(--graph-layer-calendar-view-event-background-color);
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid var(--graph-layer-calendar-view-event-border-color);
    cursor: pointer;
  }
  .calendar-event:hover {
    background-color: var(--graph-layer-calendar-view-event-hover-background-color);
  }

  .calendar-event__text {
    color: var(--graph-layer-calendar-view-event-text-color);
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .calendar-event__description {
    white-space: pre-line;
  }
</style>
