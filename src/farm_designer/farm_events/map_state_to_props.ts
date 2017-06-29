import { Everything } from "../../interfaces";
import * as moment from "moment";
import { FarmEventProps } from "../interfaces";
import { joinFarmEventsToExecutable } from "./calendar/selectors";
import { Calendar } from "./calendar/index";
import { occurrence } from "./calendar/occurrence";

/** Prepares a FarmEvent[] for use with <FBSelect /> */
export function mapStateToProps(state: Everything): FarmEventProps {
  let x = joinFarmEventsToExecutable(state.resources.index);

  let push = (state && state.router && state.router.push) || (() => { });
  let calendar = new Calendar();
  x.map(function (fe) {
    (fe.calendar || []).map(function (date) {
      let m = moment(date);
      calendar.insert(occurrence(m, fe));
      if (fe.executable_type === "Regimen") {
        let execName = fe.executable.name;
        fe.executable.regimen_items.map((ri, i) => {
          // Add the offset, give it a special name, push it into the calendar.
          let m2 = m
            .clone()
            .startOf("day")
            .add(ri.time_offset, "milliseconds");
          let o = occurrence(m2, fe);
          o.executableName = o.executableName || "regimen";
          calendar.insert(o);
        })
      }
    });
  });

  let calendarRows = calendar.getAll();
  return { calendarRows, push };
}
