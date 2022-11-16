<template>
  <div :class="$style['calendar-week']" :style="styles">

  </div>
</template>

<script>
  export default {
    name: "CalendarWeek",

    data: () => ({

    }),

    props: {
      week: Number,
      date: Date,
      events: Array
    },

    computed: {
      styles() {
        return {
          "grid-area": `${this.week*2+1} / 1 / ${this.week*2+2} / 8`
        };
      }
    },

    created() {

    },

    methods: {

    }
  };
</script>

<style module>
  .calendar-week {

  }
</style>
