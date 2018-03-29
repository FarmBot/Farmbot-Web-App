import { TaggedFarmEvent } from "../../resources/tagged_resources";
import * as moment from "moment";

/**
 * PROBLEMS SOLVED:
 *  * You create a farm event at 3pm TODAY
 *  * The farmevent contains a regimen
 *  * The regimen is supposed to start some tasks at 2pm (1 hour before start time)
 *  * You have two options at this point:
 *     1. Reschedule it for tomorrow.
 *     2. Accept that "task loss" will occur.
 *
 * This function warns the user when "task loss" may occur.
 */
export function maybeWarnAboutMissedTasks(
  tfe: TaggedFarmEvent, cb: Function, now = moment()) {
  return function () {
    const fe = tfe.body;
    // STEP 1: Only do this check if it is a Regimen -
    // sequences don't have this issue.
    if (fe.executable_type === "Regimen") {
      const NOW = now;
      const START_TIME = moment(fe.start_time);
      const TIMEFMT = "YYYY-MM-DD";

      // STEP 2: Continue checking if the farm event is supposed to run today.
      //         since running a farmevent the day it is scheduled runs a risk
      //         of missed tasks.
      (START_TIME.format(TIMEFMT) === NOW.format(TIMEFMT)) && cb();
    }
  };
}
