// components/List/recurrence.js

import addDate from "date-fns/add";
import setDate from "date-fns/set";
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

function parseRepeat(node) {
  const repeat = {};

  const weekly = node.getElementsByTagName("weekly");

  if (weekly.length > 0) {
    const el = weekly[0];
    const info = {};

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

    if ("weekFrequency" in el.attributes) {
      info.weekFrequency = parseInt(el.attributes["weekFrequency"].nodeValue);
      if (isNaN(info.weekFrequency)) {
        info.weekFrequency = 1;
      }
    }
    else {
      info.weekFrequency = 1;
    }

    repeat.weekly = info;
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
  newEvent.startDate = setDate(newEvent.startDate,{
    year: dt.getFullYear(),
    month: dt.getMonth(),
    date: dt.getDate()
  });
  newEvent.endDate = setDate(newEvent.endDate,{
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

  replicate(event,endDate) {
    if (this.rules.length == 0) {
      return [event];
    }

    this.rules.forEach((rule) => {
      rule.state = {};
    });

    const events = this._generate(event,endDate);
    return events;
  }

  _generate(event,endDate) {
    const events = [];

    for (let i = 0;i < this.rules.length;++i) {
      const rule = this.rules[i];
      if (!rule.repeat) {
        continue;
      }

      if (rule.repeat.weekly) {
        this._generateWeekly(event,endDate,rule).forEach((ev) => events.push(ev));
      }
    }

    return events;
  }

  _generateWeekly(event,endDate,rule) {
    const events = [];

    const dts = {};
    DOWS.forEach((dow) => {
      const ndow = dow2int(dow);
      dts[dow] = setDay(event.startDate,ndow);
    });

    let n;
    let inst = 0;
    let count = 0;

    do {
      n = 0;

      DOWS.forEach((dow) => {
        const dt = dts[dow];
        dts[dow] = addDate(dt,{ weeks:1 });

        if (compareDate(dt,event.startDate) < 0) {
          return;
        }
        if (compareDate(dt,endDate) > 0 || compareDate(dt,event.endDate) > 0) {
          n += 1;
          return;
        }

        if (!rule.repeat.weekly[dow]) {
          return;
        }

        if (count % rule.repeat.weekly.weekFrequency == 0) {
          events.push(replicateEventForDate(dt,event));
        }
      });

      if (count % rule.repeat.weekly.weekFrequency == 0) {
        inst += 1;
      }

      if (rule.repeatInstances && inst >= rule.repeatInstances) {
        break;
      }

      count += 1;
    } while (n < DOWS.length);

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
