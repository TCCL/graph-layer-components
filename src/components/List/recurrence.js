// components/List/recurrence.js

import addDate from "date-fns/add";
import setDateProps from "date-fns/set";
import setDate from "date-fns/setDate";
import getDay from "date-fns/getDay";
import setDay from "date-fns/setDay";
import compareDate from "date-fns/compareAsc";

const DOWS = ["su","mo","tu","we","th","fr","sa"];

function dow2int(dow) {
  switch (dow) {
  case "su":
    return 0;
  case "mo":
    return 1;
  case "tu":
    return 2;
  case "we":
    return 3;
  case "th":
    return 4;
  case "fr":
    return 5;
  case "sa":
    return 6;
  }

  throw Error("invalid dow");
}

function int2dow(value) {
  if (value >= 0 && value < DOWS.length) {
    return DOWS[value];
  }

  throw Error("invalid dow integer");
}

function weekdayofmonth2weeks(value) {
  switch (value) {
  case "first":
    return 1;
  case "second":
    return 2;
  case "third":
    return 3;
  case "fourth":
    return 4;
  }

  throw Error("invalid weekdayOfMonth");
}

function collectDOW(info,el) {
  DOWS.forEach((dow) => {
    if (dow in el.attributes) {
      let value = el.attributes[dow].nodeValue;
      value = value.toLowerCase();
      info[dow] = ( value === "true" );
    }
    else {
      info[dow] = false;
    }
  });
}

function collectInteger(name,info,el,defaultValue) {
  if (name in el.attributes) {
    let value = parseInt(el.attributes[name].nodeValue);
    if (typeof defaultValue !== "undefined" && isNaN(value)) {
      value = defaultValue;
    }
    info[name] = value;
  }
  else if (typeof defaultValue !== "undefined") {
    info[name] = 1;
  }
}

function collectString(name,info,el,defaultValue) {
  if (name in el.attributes) {
    info[name] = el.attributes[name].nodeValue;
  }
  else if (typeof defaultValue !== "undefined") {
    info[name] = defaultValue;
  }
}

function parseRepeat(node) {
  const repeat = {};

  const weekly = node.getElementsByTagName("weekly");
  const monthly = node.getElementsByTagName("monthly");
  const monthlyByDay = node.getElementsByTagName("monthlyByDay");

  if (weekly.length > 0) {
    const el = weekly[0];
    const info = {};

    collectDOW(info,el);
    collectInteger("weekFrequency",info,el,1);

    repeat.weekly = info;
  }

  if (monthly.length > 0) {
    const el = monthly[0];
    const info = {};

    collectInteger("day",info,el);
    collectInteger("monthFrequency",info,el,1);

    repeat.monthly = info;
  }

  if (monthlyByDay.length > 0) {
    const el = monthlyByDay[0];
    const info = {};

    collectDOW(info,el);
    collectString("weekdayOfMonth",info,el);
    collectInteger("monthFrequency",info,el,1);

    repeat.monthlyByDay = info;
  }

  return repeat;
}

function parseRepeatInstances(node) {
  const result = parseInt(node.innerHTML.trim());

  if (isNaN(result)) {
    return 0;
  }

  return result;
}

let renderIdCounter = 1;
function replicateEventForDate(dt,event) {
  const newEvent = Object.assign({},event);
  newEvent.startDate = setDateProps(newEvent.startDate,{
    year: dt.getFullYear(),
    month: dt.getMonth(),
    date: dt.getDate()
  });
  newEvent.endDate = setDateProps(newEvent.endDate,{
    year: dt.getFullYear(),
    month: dt.getMonth(),
    date: dt.getDate()
  });
  newEvent.render_id += "_" + renderIdCounter.toString();
  renderIdCounter += 1;
  return newEvent;
}

class Recurrence {
  constructor(xml) {
    this.rules = [];
    this._loadRules(xml);
  }

  replicate(event,startDate,endDate) {
    if (this.rules.length == 0) {
      return [event];
    }

    const events = this._generate(event,startDate,endDate);
    return events;
  }

  _generate(event,startDate,endDate) {
    const events = [];

    for (let i = 0;i < this.rules.length;++i) {
      const rule = this.rules[i];
      if (!rule.repeat) {
        continue;
      }

      if (rule.repeat.weekly) {
        this._generateWeekly(event,startDate,endDate,rule).forEach((ev) => events.push(ev));
      }

      if (rule.repeat.monthly) {
        this._generateMonthly(event,startDate,endDate,rule).forEach((ev) => events.push(ev));
      }

      if (rule.repeat.monthlyByDay) {
        this._generateMonthlyByDay(event,startDate,endDate,rule).forEach((ev) => events.push(ev));
      }
    }

    return events;
  }

  _generateWeekly(event,startDate,endDate,rule) {
    const events = [];

    const dts = {};
    DOWS.forEach((dow) => {
      const ndow = dow2int(dow);
      dts[dow] = setDay(event.startDate,ndow);
    });

    let n;
    let inst = 0;
    let weekCount = 0;

    do {
      n = 0;

      DOWS.forEach((dow) => {
        const dt = dts[dow];
        dts[dow] = addDate(dt,{ weeks:1 });

        if (compareDate(dt,startDate) < 0 || compareDate(dt,event.startDate) < 0) {
          return;
        }
        if (compareDate(dt,endDate) > 0 || compareDate(dt,event.endDate) > 0) {
          n += 1;
          return;
        }

        if (!rule.repeat.weekly[dow]) {
          return;
        }

        if (weekCount % rule.repeat.weekly.weekFrequency == 0) {
          events.push(replicateEventForDate(dt,event));
        }
      });

      if (weekCount % rule.repeat.weekly.weekFrequency == 0) {
        inst += 1;
      }

      if (rule.repeatInstances && inst >= rule.repeatInstances) {
        break;
      }

      weekCount += 1;
    } while (n < DOWS.length);

    return events;
  }

  _generateMonthly(event,startDate,endDate,rule) {
    const events = [];

    let inst = 0;
    let monthCount = 0;
    let dt = event.startDate;

    while (true) {
      const evdt = setDate(dt,rule.repeat.monthly.day);
      dt = addDate(dt,{ months:1 });

      if (compareDate(evdt,startDate) < 0) {
        continue;
      }

      if (compareDate(evdt,endDate) > 0 || compareDate(evdt,event.endDate) > 0) {
        break;
      }

      if (monthCount % rule.repeat.monthly.monthFrequency == 0) {
        events.push(replicateEventForDate(evdt,event));
        inst += 1;
      }

      if (rule.repeatInstances && inst >= rule.repeatInstances) {
        break;
      }

      monthCount += 1;
    }

    return events;
  }

  _generateMonthlyByDay(event,startDate,endDate,rule) {
    const events = [];

    let inst = 0;
    let monthCount = 0;
    let dt = setDate(event.startDate,1);
    const addWeeks = {
      weeks: weekdayofmonth2weeks(rule.repeat.monthlyByDay.weekdayOfMonth) - 1
    };

    while (true) {
      const evdt = dt;
      dt = addDate(dt,{ months:1 });

      let done = true;
      DOWS.forEach((dow) => {
        if (!rule.repeat.monthlyByDay[dow]) {
          return;
        }

        const dowint = dow2int(dow);
        let dowdt = addDate(setDay(evdt,dowint),addWeeks);

        if (compareDate(dowdt,endDate) > 0 || compareDate(dowdt,event.endDate) > 0) {
          return;
        }
        done = false;

        if (compareDate(dowdt,startDate) < 0 || compareDate(dowdt,event.startDate) < 0) {
          return;
        }

        if (monthCount % rule.repeat.monthlyByDay.monthFrequency == 0) {
          events.push(replicateEventForDate(dowdt,event));
        }
      });

      if (done) {
        break;
      }

      if (monthCount % rule.repeat.monthlyByDay.monthFrequency == 0) {
        inst += 1;
      }

      if (rule.repeatInstances && inst >= rule.repeatInstances) {
        break;
      }

      monthCount += 1;
    }

    return events;
  }

  _loadRules(xml) {
    // Parse recurrence data from its XML representation. The Microsoft
    // platform returns recurrence data according to the following schema:
    //  http://pvginkel.github.io/HailStorm/namespaces/http_schemas_microsoft_com_hs_2001_10_myCalendar/namespace-overview.html

    const nodes = xml.getElementsByTagName("rule");
    for (let i = 0;i < nodes.length;++i) {
      const node = nodes[i];
      const rule = {};
      const firstDayOfWeek = node.getElementsByTagName("firstDayOfWeek");
      const repeat = node.getElementsByTagName("repeat");
      const repeatInstances = node.getElementsByTagName("repeatInstances");

      if (firstDayOfWeek.length > 0) {
        rule.firstDayOfWeek = firstDayOfWeek[0].innerHTML;
      }

      if (repeat.length > 0) {
        rule.repeat = parseRepeat(repeat[0]);
      }

      if (repeatInstances.length > 0) {
        rule.repeatInstances = parseRepeatInstances(repeatInstances[0]);
      }

      this.rules.push(rule);
    }
  }
}

function createRecurrenceData(recurrenceXml) {
  let xml;
  const parser = new DOMParser();

  try {
    xml = parser.parseFromString(recurrenceXml,"text/xml");
  } catch (error) {
    return false;
  }

  return new Recurrence(xml);
}

export {
  createRecurrenceData
};
