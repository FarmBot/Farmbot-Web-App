import { Everything } from "../../interfaces";
import * as moment from "moment";
import { FarmEventProps } from "../interfaces";
import { joinFarmEventsToExecutable } from "./calendar/selectors";
import { Calendar } from "./calendar/index";
import { occurrence } from "./calendar/occurrence";
import { findSequenceById } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { FarmEventWithRegimen, FarmEventWithSequence } from "./calendar/interfaces";
import { scheduleForFarmEvent } from "./calendar/scheduler";

/** Prepares a FarmEvent[] for use with <FBSelect /> */
export function mapStateToProps(state: Everything): FarmEventProps {
  const push = (state && state.router && state.router.push) || (() => { });
  const calendar = mapResourcesToCalendar(state.resources.index, moment.now());
  const calendarRows = calendar.getAll();
  return { calendarRows, push };
}

/** TODO: Reduce complexity, but write *good* unit tests *before* refactoring.*/
export function mapResourcesToCalendar(ri: ResourceIndex, unixNow = moment.now()): Calendar {
  const x = joinFarmEventsToExecutable(ri);
  const calendar = new Calendar();
  const addRegimenToCalendar = regimenCalendarAdder(ri);

  x.map(function (fe) {
    switch (fe.executable_type) {
      case "Regimen": return addRegimenToCalendar(fe, calendar);
      case "Sequence": return addSequenceToCalendar(fe, calendar);
      default: throw new Error(`Bad fe: ${JSON.stringify(fe)}`);
    }
  });

  return calendar;
}
export let regimenCalendarAdder = (index: ResourceIndex) =>
  (f: FarmEventWithRegimen, c: Calendar) => {
    const { regimen_items } = f.executable;
    const now = moment();
    const fromEpoch = (ms: number) => moment(f.start_time)
      .startOf("day")
      .add(ms, "ms");
    const o = occurrence(moment(f.start_time), f);
    o.heading = f.executable.name;
    o.subheading = "";
    c.insert(o);
    regimen_items.map(ri => {
      const time = fromEpoch(ri.time_offset);
      if (time.isAfter(now) && time.isAfter(moment(f.start_time))) {
        const oo = occurrence(time, f);
        const seq = findSequenceById(index, ri.sequence_id);
        oo.heading = f.executable.name;
        oo.subheading = seq.body.name;
        c.insert(oo);
      }
    });
  };

export let addSequenceToCalendar =
  (f: FarmEventWithSequence, c: Calendar, now = moment()) => {
    scheduleForFarmEvent(f)
      .filter(m => m.isAfter(now))
      .map(m => c.insert(occurrence(m, f)));
  };
