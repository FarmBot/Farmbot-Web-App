import { Everything, TimeSettings } from "../../interfaces";
import moment from "moment";
import { FarmEventProps } from "../interfaces";
import { joinFarmEventsToExecutable } from "./calendar/selectors";
import { Calendar } from "./calendar/index";
import { occurrence } from "./calendar/occurrence";
import {
  findSequenceById,
  maybeGetDevice,
  maybeGetTimeSettings,
} from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import {
  FarmEventWithRegimen, FarmEventWithSequence,
} from "./calendar/interfaces";
import { scheduleForFarmEvent } from "./calendar/scheduler";
import { last } from "lodash";
import { RegimenItem } from "../../regimens/interfaces";

/** Prepares a FarmEvent[] for use with <FBSelect /> */
export function mapStateToProps(state: Everything): FarmEventProps {
  const timeSettings = maybeGetTimeSettings(state.resources.index);
  const calendar =
    mapResourcesToCalendar(state.resources.index, timeSettings, moment());
  const calendarRows = calendar.getAll();
  const dev = maybeGetDevice(state.resources.index);
  const timezoneIsSet = !!(dev && (dev.body.timezone));
  return { calendarRows, timezoneIsSet };
}

export function mapResourcesToCalendar(
  ri: ResourceIndex, timeSettings: TimeSettings, now = moment()): Calendar {
  const x = joinFarmEventsToExecutable(ri);
  const calendar = new Calendar();
  const addRegimenToCalendar = regimenCalendarAdder(ri, timeSettings);

  x.map(function (fe) {
    switch (fe.executable_type) {
      case "Regimen": return addRegimenToCalendar(fe, calendar, now);
      case "Sequence":
        return addSequenceToCalendar(fe, calendar, timeSettings, now);
    }
  });

  return calendar;
}

const fromEpoch = (ms: number, start_time: string, timeSettings: TimeSettings) =>
  moment(start_time)
    .utcOffset(timeSettings.utcOffset)
    .startOf("day")
    .add(ms, "ms");

const itemGracePeriod = (now: moment.Moment) =>
  now.clone().subtract(1, "minute");

export const nextRegItemTimes =
  (regimenItems: RegimenItem[],
    startTime: string,
    now: moment.Moment,
    timeSettings: TimeSettings): moment.Moment[] => {
    const times = regimenItems.map(ri =>
      fromEpoch(ri.time_offset, startTime, timeSettings));
    return times.filter(time => time.isSameOrAfter(itemGracePeriod(now))
      && time.isSameOrAfter(moment(startTime)));
  };

export const regimenCalendarAdder = (
  index: ResourceIndex, timeSettings: TimeSettings) =>
  (f: FarmEventWithRegimen, c: Calendar, now = moment()) => {
    const { regimen_items } = f.executable;
    const gracePeriod = itemGracePeriod(now);
    const lastRI = last(regimen_items);
    const lastRITime = lastRI &&
      fromEpoch(lastRI.time_offset, f.start_time, timeSettings);
    if (lastRITime && lastRITime.isSameOrAfter(gracePeriod)) {
      const o = occurrence(moment(f.start_time), f, timeSettings);
      o.heading = f.executable.name;
      o.subheading = "";
      c.insert(o);
    }
    regimen_items.map(ri => {
      const time = fromEpoch(ri.time_offset, f.start_time, timeSettings);
      if (time.isSameOrAfter(gracePeriod)
        && time.isSameOrAfter(moment(f.start_time))) {
        const oo = occurrence(time, f, timeSettings);
        const seq = findSequenceById(index, ri.sequence_id);
        oo.heading = f.executable.name;
        oo.subheading = seq.body.name;
        c.insert(oo);
      }
    });
    // Display empty regimens in UI so that they can be edited or deleted.
    if (f.end_time && Object.keys(c.value).length === 0) {
      c.insert(occurrence(moment(f.end_time), f, timeSettings, { empty: true }));
    }
  };

export const addSequenceToCalendar =
  (f: FarmEventWithSequence, c: Calendar, timeSettings: TimeSettings,
    now = moment()) => {
    const schedule = scheduleForFarmEvent(f, now);
    // Display empty calendars in UI so that they can be edited or deleted.
    if (f.end_time && schedule.items.length === 0) {
      c.insert(occurrence(moment(f.end_time), f, timeSettings, { empty: true }));
    }
    // Separate the last item from the calendar.
    const lastItem = schedule.items.pop();
    // Add all other items.
    schedule.items.map(m => c.insert(occurrence(m, f, timeSettings)));
    if (schedule.shortenedBy > 0) {
      // Indicate that not all items are displayed in the final item.
      lastItem && c.insert(occurrence(
        lastItem, f, timeSettings, { numHidden: schedule.shortenedBy }));
    } else {
      // Add the final item. All items are displayed.
      lastItem && c.insert(occurrence(lastItem, f, timeSettings));
    }
  };
