import moment from "moment";
import { CalendarOccurrence } from "../../interfaces";
import { FarmEventWithExecutable } from "./interfaces";
import { Calendar } from "./index";

/** An occurrence is a single event on the calendar, usually rendered as a
 * little white square on the farm event UI. This is the data representation for
 * single calendar entries. */
export function occurrence(
  m: moment.Moment,
  fe: FarmEventWithExecutable,
  utcOffset: number,
  modifiers?: { numHidden?: number, empty?: boolean }):
  CalendarOccurrence {
  const normalHeading = fe.executable.name || fe.executable_type;
  const heading = () => {
    if (modifiers && modifiers.empty) {
      return "*Empty*";
    }
    if (modifiers && modifiers.numHidden) {
      return `+ ${modifiers.numHidden} more: ` + normalHeading;
    }
    return normalHeading;
  };
  return {
    mmddyy: m.utcOffset(utcOffset).format(Calendar.DATE_FORMAT),
    sortKey: m.unix(),
    timeStr: m.clone().utcOffset(utcOffset).format("hh:mma"),
    heading: heading(),
    executableId: fe.executable_id || 0,
    id: fe.id || 0,
  };
}
