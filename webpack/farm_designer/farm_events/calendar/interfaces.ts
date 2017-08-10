import { FarmEvent, ExecutableType } from "../../interfaces";
import { Regimen } from "../../../regimens/interfaces";
import { Sequence } from "../../../sequences/interfaces";

/** Would it be better to make a fully formed farm event? Join regimen, sequence, etc. */

/** STEP 1: Extract querying of data and formatting of data into two
 * sep. function. This function will join `executable` on `farm_event`. */

export type FarmEventWithExecutable = FarmEventWithRegimen | FarmEventWithSequence;

/** Takes a farm event and merges it with its sequence object. */
export interface FarmEventWithSequence extends FarmEvent {
  executable_type: "Sequence";
  executable: Sequence;
}

/** Takes a farm event and merges it with its regimen object. */
export interface FarmEventWithRegimen extends FarmEvent {
  executable_type: "Regimen";
  executable: Regimen;
}

/** STEP 2: Once all the resource queries are done, create data that looks
 *          like this: */
export interface NewCalendarItem {
  dayOfMonth: number;
  month: string;
  executable_id: number;
  executable_type: ExecutableType;
  farm_event_id: number;
  label: string;
  sortKey: number;
  timeStr: string;
}
