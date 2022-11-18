<template>
  <div :class="$style['calendar-event']">
    <span :class="$style['calendar-event__text']">{{ eventInfo.event.title }}</span>
  </div>
</template>

<script>
  export default {
    name: "CalendarEvent",

    data: () => ({

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
    background-color: var(--graph-layer-color-primary);
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid var(--graph-layer-border-color);
  }

  .calendar-event__text {
    color: var(--graph-layer-color-background);
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
