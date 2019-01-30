import { Everything } from "../../interfaces";
import moment from "moment";
import { FarmEventProps } from "../interfaces";
import { joinFarmEventsToExecutable } from "./calendar/selectors";
import { Calendar } from "./calendar/index";
import { occurrence } from "./calendar/occurrence";
import {
  findSequenceById,
  maybeGetTimeOffset,
  maybeGetDevice
} from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { FarmEventWithRegimen, FarmEventWithSequence } from "./calendar/interfaces";
import { scheduleForFarmEvent } from "./calendar/scheduler";
import { last } from "lodash";
import { RegimenItem } from "../../regimens/interfaces";

/** Prepares a FarmEvent[] for use with <FBSelect /> */
export function mapStateToProps(state: Everything): FarmEventProps {
  const calendar = mapResourcesToCalendar(state.resources.index, moment());
  const calendarRows = calendar.getAll();
  const dev = maybeGetDevice(state.resources.index);
  const timezoneIsSet = !!(dev && (dev.body.timezone));
  return { calendarRows, timezoneIsSet };
}

export function mapResourcesToCalendar(
  ri: ResourceIndex, now = moment()): Calendar {
  const x = joinFarmEventsToExecutable(ri);
  const calendar = new Calendar();
  const addRegimenToCalendar = regimenCalendarAdder(ri);
  const tz_offset_hrs = maybeGetTimeOffset(ri);

  x.map(function (fe) {
    switch (fe.executable_type) {
      case "Regimen": return addRegimenToCalendar(fe, calendar, now);
      case "Sequence":
        return addSequenceToCalendar(fe, calendar, now, tz_offset_hrs);
    }
  });

  return calendar;
}

const fromEpoch = (ms: number, start_time: string, tz_offset_hrs: number) =>
  moment(start_time)
    .utcOffset(tz_offset_hrs)
    .startOf("day")
    .add(ms, "ms");

const itemGracePeriod = (now: moment.Moment) =>
  now.clone().subtract(1, "minute");

export const nextRegItemTimes =
  (regimenItems: RegimenItem[],
    startTime: string,
    now: moment.Moment,
    tzOffset: number): moment.Moment[] => {
    const times = regimenItems.map(ri =>
      fromEpoch(ri.time_offset, startTime, tzOffset));
    return times.filter(time => time.isSameOrAfter(itemGracePeriod(now))
      && time.isSameOrAfter(moment(startTime)));
  };

export let regimenCalendarAdder = (index: ResourceIndex) =>
  (f: FarmEventWithRegimen, c: Calendar, now = moment()) => {
    const tz_offset = maybeGetTimeOffset(index);
    const { regimen_items } = f.executable;
    const gracePeriod = itemGracePeriod(now);
    const lastRI = last(regimen_items);
    const lastRITime = lastRI &&
      fromEpoch(lastRI.time_offset, f.start_time, tz_offset);
    if (lastRITime && lastRITime.isSameOrAfter(gracePeriod)) {
      const o = occurrence(moment(f.start_time), f, tz_offset);
      o.heading = f.executable.name;
      o.subheading = "";
      c.insert(o);
    }
    regimen_items.map(ri => {
      const time = fromEpoch(ri.time_offset, f.start_time, tz_offset);
      if (time.isSameOrAfter(gracePeriod)
        && time.isSameOrAfter(moment(f.start_time))) {
        const oo = occurrence(time, f, tz_offset);
        const seq = findSequenceById(index, ri.sequence_id);
        oo.heading = f.executable.name;
        oo.subheading = seq.body.name;
        c.insert(oo);
      }
    });
    // Display empty regimens in UI so that they can be edited or deleted.
    if (f.end_time && Object.keys(c.value).length === 0) {
      c.insert(occurrence(moment(f.end_time), f, tz_offset, { empty: true }));
    }
  };

export let addSequenceToCalendar =
  (f: FarmEventWithSequence, c: Calendar, now = moment(), offset: number) => {
    const schedule = scheduleForFarmEvent(f, now);
    // Display empty calendars in UI so that they can be edited or deleted.
    if (f.end_time && schedule.items.length === 0) {
      c.insert(occurrence(moment(f.end_time), f, offset, { empty: true }));
    }
    // Separate the last item from the calendar.
    const lastItem = schedule.items.pop();
    // Add all other items.
    schedule.items.map(m => c.insert(occurrence(m, f, offset)));
    if (schedule.shortenedBy > 0) {
      // Indicate that not all items are displayed in the final item.
      lastItem && c.insert(occurrence(
        lastItem, f, offset, { numHidden: schedule.shortenedBy }));
    } else {
      // Add the final item. All items are displayed.
      lastItem && c.insert(occurrence(lastItem, f, offset));
    }
  };
