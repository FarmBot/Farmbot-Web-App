import { Everything } from "../../interfaces";
import * as moment from "moment";
import { FarmEventProps } from "../interfaces";
import { joinFarmEventsToExecutable } from "./calendar/selectors";
import { Calendar } from "./calendar/index";
import { occurrence } from "./calendar/occurrence";
import { findSequenceById, getDeviceAccountSettings } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { FarmEventWithRegimen, FarmEventWithSequence } from "./calendar/interfaces";
import { scheduleForFarmEvent } from "./calendar/scheduler";
import { last } from "lodash";

/** Prepares a FarmEvent[] for use with <FBSelect /> */
export function mapStateToProps(state: Everything): FarmEventProps {
  const push = (state && state.router && state.router.push) || (() => { });
  const calendar = mapResourcesToCalendar(state.resources.index, moment());
  const calendarRows = calendar.getAll();
  return { calendarRows, push };
}

/** TODO: Reduce complexity, but write *good* unit tests *before* refactoring.*/
export function mapResourcesToCalendar(
  ri: ResourceIndex, now = moment()): Calendar {
  const x = joinFarmEventsToExecutable(ri);
  const calendar = new Calendar();
  const addRegimenToCalendar = regimenCalendarAdder(ri);
  const { tz_offset_hrs } = getDeviceAccountSettings(ri).body;

  x.map(function (fe) {
    switch (fe.executable_type) {
      case "Regimen":
        return addRegimenToCalendar(
          fe, calendar, now);
      case "Sequence":
        return addSequenceToCalendar(fe, calendar, now, tz_offset_hrs);
      default:
        throw new Error(`Bad fe: ${JSON.stringify(fe)}`);
    }
  });

  return calendar;
}
export let regimenCalendarAdder = (index: ResourceIndex) =>
  (f: FarmEventWithRegimen, c: Calendar, now = moment()) => {
    const { tz_offset_hrs } = getDeviceAccountSettings(index).body;
    const { regimen_items } = f.executable;
    const fromEpoch = (ms: number) => moment(f.start_time)
      .startOf("day")
      .add(ms, "ms");
    const gracePeriod = now.clone().subtract(1, "minute");
    const lastRI = last(regimen_items);
    if (lastRI && fromEpoch(lastRI.time_offset).isSameOrAfter(gracePeriod)) {
      const o = occurrence(moment(f.start_time), f, tz_offset_hrs);
      o.heading = f.executable.name;
      o.subheading = "";
      c.insert(o);
    }
    regimen_items.map(ri => {
      const time = fromEpoch(ri.time_offset);
      if (time.isSameOrAfter(gracePeriod)
        && time.isSameOrAfter(moment(f.start_time))) {
        const oo = occurrence(time, f, tz_offset_hrs);
        const seq = findSequenceById(index, ri.sequence_id);
        oo.heading = f.executable.name;
        oo.subheading = seq.body.name;
        c.insert(oo);
      }
    });
  };

export let addSequenceToCalendar =
  (f: FarmEventWithSequence, c: Calendar, now = moment(), offset: number) => {
    scheduleForFarmEvent(f, now)
      .map(m => c.insert(occurrence(m, f, offset)));
  };
